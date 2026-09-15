import {
  CodeBuildClient,
  StartBuildCommand,
  StopBuildCommand,
  BatchGetBuildsCommand,
  type Build,
} from "@aws-sdk/client-codebuild";
import { env } from "../config/env.js";

const client = new CodeBuildClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export interface StartBuildParams {
  repoFullName: string;
  branch: string;
  subdomain: string;
  buildCommand: string;
  outputDirectory: string;
  commitHash?: string | null;
}

export interface CodeBuildStartResult {
  awsBuildId: string;
  logGroupName: string;
  logStreamName: string;
}

export async function startCodeBuild(
  params: StartBuildParams
): Promise<CodeBuildStartResult> {
  const command = new StartBuildCommand({
    projectName: env.CODEBUILD_PROJECT_NAME,
    environmentVariablesOverride: [
      { name: "REPO_FULL_NAME", value: params.repoFullName, type: "PLAINTEXT" },
      { name: "BRANCH", value: params.branch, type: "PLAINTEXT" },
      { name: "SUBDOMAIN", value: params.subdomain, type: "PLAINTEXT" },
      { name: "BUILD_CMD", value: params.buildCommand, type: "PLAINTEXT" },
      { name: "OUTPUT_DIR", value: params.outputDirectory, type: "PLAINTEXT" },
      { name: "S3_BUCKET", value: env.S3_BUILDS_BUCKET, type: "PLAINTEXT" },
    ],
    sourceVersion: params.commitHash ?? undefined,
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
