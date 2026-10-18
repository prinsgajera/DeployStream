import { Types } from "mongoose";
import { RepositoryModel, type IRepositoryDocument, type IEnvVar } from "../../models/repository.model.js";
import { decryptToken } from "../../lib/crypto.js";
import { UserModel } from "../../models/user.model.js";
import { BuildModel, BuildStatus } from "../../models/build.model.js";
import { CodedError, isDuplicateKeyError } from "../../lib/errors.js";
import {
  MAX_SUGGESTIONS,
  buildSuggestionCandidates,
  validateSubdomain,
  type SubdomainRejection,
} from "./subdomain.js";
import { createPushWebhook, deleteWebhook } from "../../services/github.service.js";
import { buildDeployedUrl, copySiteFiles, deleteSiteFiles } from "../../services/s3.service.js";
import { encryptSecretEnvVars, maskSecretEnvVars, mergeEnvVars } from "./env-vars.js";
import type { FastifyBaseLogger } from "fastify";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  updated_at: string;
  language: string | null;
  description: string | null;
}

export interface ImportRepositoryPayload {
  githubRepoId: string;
  repoName: string;
  fullName: string;
  subdomain: string;
  branch: string;
  framework: string;
  buildCommand: string;
  outputDirectory: string;
  envVars: Array<{ key: string; value: string; isSecret: boolean }>;
}

export async function fetchUserGitHubRepos(userId: string): Promise<GitHubRepo[]> {
  const user = await UserModel.findById(userId).select("githubToken");
  if (!user) throw new Error("User not found");

  const accessToken = decryptToken(user.githubToken);

  const response = await fetch(
    "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<GitHubRepo[]>;
}

async function getDecryptedGitHubToken(userId: string): Promise<string | null> {
  const user = await UserModel.findById(userId).select("githubToken");
  return user ? decryptToken(user.githubToken) : null;
}

export async function importRepository(
  userId: string,
  payload: ImportRepositoryPayload,
  log: FastifyBaseLogger
): Promise<IRepositoryDocument> {
  const rejection = validateSubdomain(payload.subdomain);
  if (rejection) throw subdomainRejectionError(rejection);

  const existing = await RepositoryModel.findOne({
    $or: [
      { githubRepoId: payload.githubRepoId },
      { fullName: payload.fullName },
      { subdomain: payload.subdomain },
    ],
  });

  if (existing) {
    if (existing.githubRepoId === payload.githubRepoId || existing.fullName === payload.fullName) {
      const conflict = new Error("Repository already imported");
      (conflict as NodeJS.ErrnoException).code = "REPO_CONFLICT";
      throw conflict;
    }
    const conflict = new Error("Subdomain already taken");
    (conflict as NodeJS.ErrnoException).code = "SUBDOMAIN_CONFLICT";
    throw conflict;
  }

  const repository = await RepositoryModel.create({
    userId: new Types.ObjectId(userId),
    githubRepoId: payload.githubRepoId,
    repoName: payload.repoName,
    fullName: payload.fullName,
    subdomain: payload.subdomain,
    branch: payload.branch,
    framework: payload.framework,
    buildCommand: payload.buildCommand,
    outputDirectory: payload.outputDirectory,
    envVars: encryptSecretEnvVars(payload.envVars),
    isActive: true,
  });

  try {
    const accessToken = await getDecryptedGitHubToken(userId);
    const webhookId = accessToken
      ? await createPushWebhook(accessToken, payload.fullName)
      : null;

    if (webhookId) {
      repository.webhookId = webhookId;
      await repository.save();
    } else {
      log.warn({ repositoryId: String(repository._id) }, "GitHub webhook not created (PUBLIC_API_URL unset)");
    }
  } catch (err) {
    log.error({ err, repositoryId: String(repository._id) }, "Failed to create GitHub webhook");
  }

  return repository;
}

const REJECTION_ERRORS: Record<SubdomainRejection, { code: string; message: string }> = {
  invalid: {
    code: "INVALID_SUBDOMAIN",
    message: "Use 3-63 lowercase letters, numbers or hyphens, without starting, ending or doubling hyphens.",
  },
  reserved: { code: "RESERVED_SUBDOMAIN", message: "This name is reserved. Please choose another." },
};

function subdomainRejectionError(rejection: SubdomainRejection): CodedError {
  const { code, message } = REJECTION_ERRORS[rejection];
  return new CodedError(code, message);
}

export interface SubdomainAvailability {
  available: boolean;
  reason?: SubdomainRejection | "taken";
  suggestions: string[];
}

export async function checkSubdomainAvailability(
  subdomain: string,
  excludeRepositoryId?: string
): Promise<SubdomainAvailability> {
  const rejection = validateSubdomain(subdomain);
  if (rejection) return { available: false, reason: rejection, suggestions: [] };

  const excludeFilter = excludeRepositoryId ? { _id: { $ne: excludeRepositoryId } } : {};
  const isTaken = await RepositoryModel.exists({ subdomain, ...excludeFilter });
  if (!isTaken) return { available: true, suggestions: [] };

  const candidates = buildSuggestionCandidates(subdomain);
  const takenCandidates = await RepositoryModel.find({ subdomain: { $in: candidates } }).select("subdomain");
  const takenNames = new Set(takenCandidates.map((repository) => repository.subdomain));
  const suggestions = candidates.filter((candidate) => !takenNames.has(candidate)).slice(0, MAX_SUGGESTIONS);

  return { available: false, reason: "taken", suggestions };
}

export async function renameSubdomain(
  userId: string,
  repositoryId: string,
  subdomain: string,
  log: FastifyBaseLogger
): Promise<IRepositoryDocument | null> {
  const rejection = validateSubdomain(subdomain);
  if (rejection) throw subdomainRejectionError(rejection);

  const repository = await RepositoryModel.findOne({
    _id: repositoryId,
    userId: new Types.ObjectId(userId),
  });
  if (!repository) return null;
  if (repository.subdomain === subdomain) return repository;

  const activeBuild = await BuildModel.exists({
    repositoryId: repository._id,
    status: { $in: [BuildStatus.QUEUED, BuildStatus.BUILDING] },
  });
  if (activeBuild) {
    throw new CodedError("BUILD_IN_PROGRESS", "Wait for the running build to finish before renaming.");
  }

  if (await RepositoryModel.exists({ subdomain })) {
    throw new CodedError("SUBDOMAIN_CONFLICT", "This subdomain is already taken. Please choose another.");
  }

  const previousSubdomain = repository.subdomain;
  const wasDeployed = repository.deployedUrl !== null;
  if (wasDeployed) await copySiteFiles(previousSubdomain, subdomain);

  try {
    repository.subdomain = subdomain;
    if (wasDeployed) repository.deployedUrl = buildDeployedUrl(subdomain);
    await repository.save();
  } catch (err) {
    if (wasDeployed) {
      await deleteSiteFiles(subdomain).catch((cleanupErr: unknown) =>
        log.error({ err: cleanupErr, repositoryId }, "Failed to roll back copied site files")
      );
    }
    if (isDuplicateKeyError(err)) {
      throw new CodedError("SUBDOMAIN_CONFLICT", "This subdomain is already taken. Please choose another.");
    }
    throw err;
  }

  if (wasDeployed) {
    await deleteSiteFiles(previousSubdomain).catch((cleanupErr: unknown) =>
      log.error({ err: cleanupErr, repositoryId, previousSubdomain }, "Failed to delete old site files")
    );
  }

  return repository;
}

export function serializeRepository(repository: IRepositoryDocument): Record<string, unknown> {
  return { ...repository.toJSON(), envVars: maskSecretEnvVars(repository.envVars) };
}

export async function getUserRepositories(userId: string): Promise<IRepositoryDocument[]> {
  return RepositoryModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
}

export interface UpdateRepositorySettingsPayload {
  branch?: string;
  framework?: string;
  buildCommand?: string;
  outputDirectory?: string;
  envVars?: IEnvVar[];
}

export async function updateRepositorySettings(
  userId: string,
  repositoryId: string,
  payload: UpdateRepositorySettingsPayload
): Promise<IRepositoryDocument | null> {
  const repository = await RepositoryModel.findOne({
    _id: repositoryId,
    userId: new Types.ObjectId(userId),
  });
  if (!repository) return null;

  const { envVars, ...fields } = payload;
  repository.set(fields);
  if (envVars) {
    repository.envVars = mergeEnvVars(repository.envVars, envVars);
  }

  return repository.save();
}

export async function deleteUserRepository(
  userId: string,
  repositoryId: string,
  log: FastifyBaseLogger
): Promise<boolean> {
  const repository = await RepositoryModel.findOneAndDelete({
    _id: repositoryId,
    userId: new Types.ObjectId(userId),
  }).select("fullName subdomain webhookId");

  if (!repository) return false;

  const cleanup = await Promise.allSettled([
    BuildModel.deleteMany({ repositoryId: repository._id }),
    deleteSiteFiles(repository.subdomain),
    removeWebhook(userId, repository.fullName, repository.webhookId),
  ]);

  cleanup.forEach((result) => {
    if (result.status === "rejected") {
      log.error({ err: result.reason, repositoryId }, "Repository cleanup step failed");
    }
  });

  return true;
}

async function removeWebhook(
  userId: string,
  fullName: string,
  webhookId: string | null
): Promise<void> {
  if (!webhookId) return;
  const accessToken = await getDecryptedGitHubToken(userId);
  if (accessToken) await deleteWebhook(accessToken, fullName, webhookId);
}

export async function updateAutoDeployStatus(
  userId: string,
  repositoryId: string,
  autoDeploy: boolean
): Promise<IRepositoryDocument | null> {
  return RepositoryModel.findOneAndUpdate(
    { _id: repositoryId, userId: new Types.ObjectId(userId) },
    { $set: { autoDeploy } },
    { new: true }
  );
}
