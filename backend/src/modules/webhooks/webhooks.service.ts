import { createHmac, timingSafeEqual } from "node:crypto";
import { RepositoryModel } from "../../models/repository.model.js";
import { triggerBuild } from "../builds/builds.service.js";
import { env } from "../../config/env.js";

interface GitHubPushPayload {
  ref: string;
  after: string;
  head_commit?: {
    id: string;
    message: string;
    author?: { name?: string };
  } | null;
  repository?: {
    id: number;
  };
}

export function verifyGitHubSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined
): boolean {
  if (!signatureHeader) return false;

  const expectedSignature = `sha256=${createHmac("sha256", env.GITHUB_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex")}`;

  try {
    return timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function handlePushEvent(
  payload: GitHubPushPayload
): Promise<{ triggered: boolean; buildId?: string }> {
  const branch = payload.ref?.replace("refs/heads/", "");
  const commitHash = payload.after;
  const commitMessage = payload.head_commit?.message ?? null;
  const commitAuthor = payload.head_commit?.author?.name ?? null;
  const githubRepoId = String(payload.repository?.id);

  if (!branch || !githubRepoId) {
    return { triggered: false };
  }

  const repository = await RepositoryModel.findOne({
    githubRepoId,
    branch,
    autoDeploy: true,
    isActive: true,
  });

  if (!repository) {
    return { triggered: false };
  }

  const build = await triggerBuild({
    repositoryId: String(repository._id),
    userId: String(repository.userId),
    triggeredBy: "webhook",
    commitHash,
    commitMessage,
    commitAuthor,
  });

  return { triggered: true, buildId: String(build._id) };
}
