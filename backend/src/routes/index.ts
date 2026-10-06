import type { FastifyInstance } from "fastify";
import healthRoutes from "../modules/health/health.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import repositoriesRoutes from "../modules/repositories/repositories.routes.js";
import buildsRoutes from "../modules/builds/builds.routes.js";
import webhooksRoutes from "../modules/webhooks/webhooks.routes.js";
import websocketPlugin from "../lib/websocket.js";

export async function apiRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(healthRoutes);
  await fastify.register(authRoutes);
  await fastify.register(repositoriesRoutes);
  await fastify.register(buildsRoutes);
  await fastify.register(webhooksRoutes);
  await fastify.register(websocketPlugin);
}
