import { Types } from "mongoose";
import { RepositoryModel, type IRepositoryDocument } from "../../models/repository.model.js";
import { decryptToken } from "../../lib/crypto.js";
import { UserModel } from "../../models/user.model.js";
import { BuildModel } from "../../models/build.model.js";
import { createPushWebhook, deleteWebhook } from "../../services/github.service.js";
import { deleteSiteFiles } from "../../services/s3.service.js";
import { encryptSecretEnvVars } from "./env-vars.js";
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

export async function getUserRepositories(userId: string): Promise<IRepositoryDocument[]> {
  return RepositoryModel.find({ userId: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .select("-envVars.value");
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
  ).select("-envVars.value");
}
