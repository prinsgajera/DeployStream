export type BuildStatusType = "SUCCESS" | "BUILDING" | "QUEUED" | "FAILED" | "IDLE";

export interface RepositoryItem {
  id: string;
  repoName: string;
  fullName: string;
  githubRepoId: string;
  subdomain: string;
  branch: string;
  framework: string;
  buildCommand: string;
  outputDirectory: string;
  status: "active" | "inactive" | "building";
  lastDeployed: string;
  commitHash: string;
  commitMessage: string;
  autoDeploy: boolean;
  latencyMs: number;
  environment: string;
  isActive: boolean;
  s3BucketUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BuildHistoryItem {
  id: string;
  repositoryId: string;
  repoName: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  authorAvatar?: string;
  branch: string;
  startedAt: string;
  duration: string;
  status: BuildStatusType;
  logs?: string[];
}

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
}

export interface GitHubRepoOption {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  updated_at: string;
  language: string | null;
  description: string | null;
}

export interface ImportedRepository {
  id: string;
  userId: string;
  repoName: string;
  fullName: string;
  githubRepoId: string;
  subdomain: string;
  branch: string;
  framework: string;
  buildCommand: string;
  outputDirectory: string;
  isActive: boolean;
  autoDeploy: boolean;
  s3BucketUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
