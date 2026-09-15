import { Types } from "mongoose";
import { RepositoryModel, type IRepositoryDocument } from "../../models/repository.model.js";
import { decryptToken } from "../../lib/crypto.js";
import { UserModel } from "../../models/user.model.js";

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

export async function importRepository(
  userId: string,
  payload: ImportRepositoryPayload
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
    envVars: payload.envVars,
    isActive: true,
  });

  return repository;
}

export async function getUserRepositories(userId: string): Promise<IRepositoryDocument[]> {
  return RepositoryModel.find({ userId: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .select("-envVars.value");
}

export async function deleteUserRepository(
  userId: string,
  repositoryId: string
): Promise<boolean> {
  const result = await RepositoryModel.deleteOne({
    _id: repositoryId,
    userId: new Types.ObjectId(userId),
  });
  return result.deletedCount === 1;
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
