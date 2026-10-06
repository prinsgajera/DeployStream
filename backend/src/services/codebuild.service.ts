import {
  CodeBuildClient,
  StartBuildCommand,
  StopBuildCommand,
  BatchGetBuildsCommand,
  type Build,
  type EnvironmentVariable,
} from "@aws-sdk/client-codebuild";
import { env } from "../config/env.js";

const client = new CodeBuildClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const VALID_ENV_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
const RESERVED_ENV_PREFIX = "CODEBUILD_";
const RESERVED_ENV_NAMES = new Set([
  "REPO_FULL_NAME",
  "BRANCH",
  "COMMIT_HASH",
  "SUBDOMAIN",
  "BUILD_CMD",
  "OUTPUT_DIR",
  "S3_BUCKET",
  "GITHUB_TOKEN",
]);

export interface UserEnvVar {
  key: string;
  value: string;
}

export interface StartBuildParams {
  repoFullName: string;
  branch: string;
  subdomain: string;
  buildCommand: string;
  outputDirectory: string;
  githubToken: string;
  commitHash?: string | null | undefined;
  userEnvVars?: UserEnvVar[];
}

export interface CodeBuildStartResult {
  awsBuildId: string;
  logGroupName: string;
  logStreamName: string;
}

function toUserEnvironmentVariables(userEnvVars: UserEnvVar[]): EnvironmentVariable[] {
  return userEnvVars
    .filter(
      ({ key }) =>
        VALID_ENV_NAME.test(key) &&
        !key.startsWith(RESERVED_ENV_PREFIX) &&
        !RESERVED_ENV_NAMES.has(key)
    )
    .map(({ key, value }) => ({ name: key, value, type: "PLAINTEXT" }));
}

export async function startCodeBuild(
  params: StartBuildParams
): Promise<CodeBuildStartResult> {
  const command = new StartBuildCommand({
    projectName: env.CODEBUILD_PROJECT_NAME,
    environmentVariablesOverride: [
      ...toUserEnvironmentVariables(params.userEnvVars ?? []),
      { name: "REPO_FULL_NAME", value: params.repoFullName, type: "PLAINTEXT" },
      { name: "BRANCH", value: params.branch, type: "PLAINTEXT" },
      { name: "COMMIT_HASH", value: params.commitHash ?? "", type: "PLAINTEXT" },
      { name: "SUBDOMAIN", value: params.subdomain, type: "PLAINTEXT" },
      { name: "BUILD_CMD", value: params.buildCommand, type: "PLAINTEXT" },
      { name: "OUTPUT_DIR", value: params.outputDirectory, type: "PLAINTEXT" },
      { name: "S3_BUCKET", value: env.S3_BUILDS_BUCKET, type: "PLAINTEXT" },
      { name: "GITHUB_TOKEN", value: params.githubToken, type: "PLAINTEXT" },
    ],
  });

  const response = await client.send(command);
  const build = response.build;

  if (!build?.id) {
    throw new Error("CodeBuild did not return a build ID");
  }

  return {
    awsBuildId: build.id,
    logGroupName: build.logs?.groupName ?? env.CLOUDWATCH_LOG_GROUP,
    logStreamName: build.logs?.streamName ?? "",
  };
}

export async function stopCodeBuild(awsBuildId: string): Promise<void> {
  await client.send(new StopBuildCommand({ id: awsBuildId }));
}

export async function getCodeBuildStatus(awsBuildId: string): Promise<Build | null> {
  const response = await client.send(
    new BatchGetBuildsCommand({ ids: [awsBuildId] })
  );
  return response.builds?.[0] ?? null;
}
