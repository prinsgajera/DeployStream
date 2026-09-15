import { Types } from "mongoose";
import { BuildModel, BuildStatus, type IBuildDocument } from "../../models/build.model.js";
import { RepositoryModel } from "../../models/repository.model.js";
import { startCodeBuild, stopCodeBuild, getCodeBuildStatus } from "../../services/codebuild.service.js";
import { buildDeployedUrl } from "../../services/s3.service.js";
import type { BuildTrigger } from "../../models/build.model.js";

export interface TriggerBuildParams {
  repositoryId: string;
  userId: string;
  triggeredBy: BuildTrigger;
  commitHash?: string | null;
  commitMessage?: string | null;
  commitAuthor?: string | null;
}

export async function triggerBuild(params: TriggerBuildParams): Promise<IBuildDocument> {
  const repository = await RepositoryModel.findOne({
    _id: new Types.ObjectId(params.repositoryId),
    userId: new Types.ObjectId(params.userId),
  });

  if (!repository) {
    const err = new Error("Repository not found") as NodeJS.ErrnoException;
    err.code = "NOT_FOUND";
    throw err;
  }

  const build = await BuildModel.create({
    repositoryId: repository._id,
    status: BuildStatus.QUEUED,
    triggeredBy: params.triggeredBy,
    commitHash: params.commitHash ?? null,
    commitMessage: params.commitMessage ?? null,
    commitAuthor: params.commitAuthor ?? null,
    branch: repository.branch,
    startedAt: new Date(),
  });

  setImmediate(async () => {
    try {
      const result = await startCodeBuild({
        repoFullName: repository.fullName,
        branch: repository.branch,
        subdomain: repository.subdomain,
        buildCommand: repository.buildCommand,
        outputDirectory: repository.outputDirectory,
        commitHash: params.commitHash,
      });

      await BuildModel.findByIdAndUpdate(build._id, {
        status: BuildStatus.BUILDING,
        awsCodeBuildId: result.awsBuildId,
        logGroupName: result.logGroupName,
        logStreamName: result.logStreamName,
      });

      await RepositoryModel.findByIdAndUpdate(repository._id, {
        $inc: { totalBuilds: 1 },
      });
    } catch (err) {
      await BuildModel.findByIdAndUpdate(build._id, {
        status: BuildStatus.FAILED,
        endedAt: new Date(),
        errorMessage: err instanceof Error ? err.message : "Failed to start CodeBuild",
      });
    }
  });

  return build;
}

export async function syncBuildStatus(buildId: string): Promise<IBuildDocument | null> {
  const build = await BuildModel.findById(buildId);
  if (!build?.awsCodeBuildId) return build;

  if (build.status === BuildStatus.SUCCESS || build.status === BuildStatus.FAILED || build.status === BuildStatus.CANCELLED) {
    return build;
  }

  const awsBuild = await getCodeBuildStatus(build.awsCodeBuildId);
  if (!awsBuild) return build;

  const phaseMap: Record<string, BuildStatus> = {
    SUCCEEDED: BuildStatus.SUCCESS,
    FAILED: BuildStatus.FAILED,
    FAULT: BuildStatus.FAILED,
    TIMED_OUT: BuildStatus.FAILED,
    STOPPED: BuildStatus.CANCELLED,
    IN_PROGRESS: BuildStatus.BUILDING,
  };

  const newStatus = phaseMap[awsBuild.buildStatus ?? ""] ?? build.status;
  const isTerminal = [BuildStatus.SUCCESS, BuildStatus.FAILED, BuildStatus.CANCELLED].includes(newStatus);

  const endedAt = isTerminal ? (awsBuild.endTime ?? new Date()) : null;
  const durationSeconds = isTerminal && awsBuild.startTime && awsBuild.endTime
    ? Math.round((awsBuild.endTime.getTime() - awsBuild.startTime.getTime()) / 1000)
    : null;

  const deployedUrl = newStatus === BuildStatus.SUCCESS
    ? buildDeployedUrl(build.repositoryId.toString())
    : null;

  const updated = await BuildModel.findByIdAndUpdate(
    build._id,
    {
      status: newStatus,
      endedAt,
      durationSeconds,
      deployedUrl,
      errorMessage: awsBuild.buildStatus === "FAILED" ? (awsBuild.phases?.find(p => p.phaseStatus === "FAILED")?.phaseType ?? null) : null,
    },
    { new: true }
  );

  if (newStatus === BuildStatus.SUCCESS && updated) {
    await RepositoryModel.findByIdAndUpdate(build.repositoryId, {
      deployedUrl: buildDeployedUrl(updated.repositoryId.toString()),
      lastDeployedAt: endedAt,
      $inc: { successfulBuilds: 1 },
    });
  }

  return updated;
}

export async function cancelBuild(buildId: string, userId: string): Promise<IBuildDocument | null> {
  const build = await BuildModel.findById(buildId).populate("repositoryId");
  if (!build) return null;

  const repo = await RepositoryModel.findOne({
    _id: build.repositoryId,
    userId: new Types.ObjectId(userId),
  });
  if (!repo) return null;

  if (build.awsCodeBuildId) {
    await stopCodeBuild(build.awsCodeBuildId);
  }

  return BuildModel.findByIdAndUpdate(
    buildId,
    { status: BuildStatus.CANCELLED, endedAt: new Date() },
    { new: true }
  );
}

export async function getBuildsForUser(userId: string): Promise<IBuildDocument[]> {
  const repos = await RepositoryModel.find(
    { userId: new Types.ObjectId(userId) },
    { _id: 1 }
  );
  const repoIds = repos.map((r) => r._id);

  return BuildModel.find({ repositoryId: { $in: repoIds } })
    .sort({ startedAt: -1 })
    .limit(100)
    .exec();
}

export async function getBuildsForRepository(
  repositoryId: string,
  userId: string
): Promise<IBuildDocument[]> {
  const repo = await RepositoryModel.findOne({
    _id: new Types.ObjectId(repositoryId),
    userId: new Types.ObjectId(userId),
  });
  if (!repo) return [];

  return BuildModel.find({ repositoryId: new Types.ObjectId(repositoryId) })
    .sort({ startedAt: -1 })
    .limit(50)
    .exec();
}

export async function getBuildById(
  buildId: string,
  userId: string
): Promise<IBuildDocument | null> {
  const build = await BuildModel.findById(buildId);
  if (!build) return null;

  const repo = await RepositoryModel.findOne({
    _id: build.repositoryId,
    userId: new Types.ObjectId(userId),
  });
  if (!repo) return null;

  return build;
}
