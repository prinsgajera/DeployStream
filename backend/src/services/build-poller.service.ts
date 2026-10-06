import type { FastifyBaseLogger } from "fastify";
import { BuildModel, BuildStatus } from "../models/build.model.js";
import { syncBuildStatus } from "../modules/builds/builds.service.js";

const POLL_INTERVAL_MS = 10_000;
const MAX_BUILDS_PER_TICK = 25;

export function startBuildPoller(log: FastifyBaseLogger): () => void {
  let isRunning = false;

  const tick = async (): Promise<void> => {
    if (isRunning) return;
    isRunning = true;

    try {
      const activeBuilds = await BuildModel.find({
        status: BuildStatus.BUILDING,
        awsCodeBuildId: { $ne: null },
      })
        .select("_id")
        .limit(MAX_BUILDS_PER_TICK);

      for (const build of activeBuilds) {
        try {
          await syncBuildStatus(String(build._id));
        } catch (err) {
          log.error({ err, buildId: String(build._id) }, "Failed to sync build status");
        }
      }
    } catch (err) {
      log.error({ err }, "Build status poll failed");
    } finally {
      isRunning = false;
    }
  };

  const timer = setInterval(() => void tick(), POLL_INTERVAL_MS);
  return () => clearInterval(timer);
}
