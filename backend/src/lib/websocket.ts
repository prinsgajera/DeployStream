import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fastifyWebSocket from "@fastify/websocket";
import { BuildModel, BuildStatus } from "../models/build.model.js";
import { RepositoryModel } from "../models/repository.model.js";
import { getLogEvents, waitForLogStream } from "../services/cloudwatch.service.js";
import { syncBuildStatus } from "../modules/builds/builds.service.js";
import { Types } from "mongoose";

const POLL_INTERVAL_MS = 2500;
const TERMINAL_STATUSES = new Set([BuildStatus.SUCCESS, BuildStatus.FAILED, BuildStatus.CANCELLED]);

interface LogFrame {
  type: "log" | "status" | "error" | "done";
  message?: string;
  timestamp?: number;
  status?: string;
}

async function websocketPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(fastifyWebSocket);

  fastify.get(
    "/api/builds/:buildId/stream",
    { websocket: true },
    async (socket, request) => {
      const { buildId } = request.params as { buildId: string };

      const send = (frame: LogFrame): void => {
        if (socket.readyState === socket.OPEN) {
          socket.send(JSON.stringify(frame));
        }
      };

      const build = await BuildModel.findById(buildId);
      if (!build) {
        send({ type: "error", message: "Build not found" });
        socket.close();
        return;
      }

      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let stopped = false;

      socket.on("close", () => {
        stopped = true;
        if (timeoutId) clearTimeout(timeoutId);
      });

      if (TERMINAL_STATUSES.has(build.status)) {
        if (build.logGroupName && build.logStreamName) {
          const result = await getLogEvents(build.logGroupName, build.logStreamName);
          for (const event of result.events) {
            send({ type: "log", message: event.message, timestamp: event.timestamp });
          }
        }
        send({ type: "done", status: build.status });
        socket.close();
        return;
      }

      if (build.logGroupName && build.logStreamName) {
        const streamReady = await waitForLogStream(build.logGroupName, build.logStreamName);
        if (!streamReady) {
          send({ type: "error", message: "Log stream not available yet. Try again shortly." });
          socket.close();
          return;
        }
      }

      let nextToken: string | null = null;

      const poll = async (): Promise<void> => {
        if (stopped) return;

        try {
          const freshBuild = await BuildModel.findById(buildId);
          if (!freshBuild) { socket.close(); return; }

          if (freshBuild.logGroupName && freshBuild.logStreamName) {
            const result = await getLogEvents(freshBuild.logGroupName, freshBuild.logStreamName, nextToken);
            for (const event of result.events) {
              send({ type: "log", message: event.message, timestamp: event.timestamp });
            }
            if (result.nextForwardToken) {
              nextToken = result.nextForwardToken;
            }
          }

          if (TERMINAL_STATUSES.has(freshBuild.status)) {
            await syncBuildStatus(String(freshBuild._id));
            send({ type: "done", status: freshBuild.status });
            socket.close();
            return;
          }

          send({ type: "status", status: freshBuild.status });
        } catch (err) {
          fastify.log.error({ err }, "WebSocket log poll error");
        }

        if (!stopped) {
          timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
        }
      };

      await poll();
    }
  );
}

export default fp(websocketPlugin, { name: "websocket-plugin" });
