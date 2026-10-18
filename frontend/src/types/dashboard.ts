export type BuildStatusType = "IDLE" | "QUEUED" | "BUILDING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface Build {
  id: string;
  repositoryId: string;
  status: BuildStatusType;
  triggeredBy: "webhook" | "manual";
  commitHash: string | null;
  commitMessage: string | null;
  commitAuthor: string | null;
  branch: string | null;
  awsCodeBuildId: string | null;
  logGroupName: string | null;
  logStreamName: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  deployedUrl: string | null;
  errorMessage: string | null;
}

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
}

export interface RepositoryEnvVar {
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
  deployedUrl: string | null;
  lastDeployedAt: string | null;
  totalBuilds: number;
  successfulBuilds: number;
  envVars: RepositoryEnvVar[];
  createdAt: string;
  updatedAt: string;
}

export interface RepositorySettingsPayload {
  branch: string;
  framework: string;
  buildCommand: string;
  outputDirectory: string;
  envVars: RepositoryEnvVar[];
}

export interface SubdomainAvailability {
  available: boolean;
  reason?: "invalid" | "reserved" | "taken";
  suggestions: string[];
}

export const ACTIVE_BUILD_STATUSES: readonly BuildStatusType[] = ["QUEUED", "BUILDING"];
