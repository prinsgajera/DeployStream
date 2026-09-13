import "dotenv/config";
import Fastify from "fastify";
import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./lib/db.js";
import app from "./app.js";

const fastify = Fastify({
  logger:
    env.NODE_ENV === "development"
      ? {
          level: "info",
          transport: {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "HH:MM:ss" },
          },
        }
      : { level: "warn" },
});

fastify.register(app);

fastify.get("/health", {
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          status: { type: "string" },
          timestamp: { type: "string" },
        },
      },
    },
  },
  handler: async () => ({ status: "ok", timestamp: new Date().toISOString() }),
});

const start = async (): Promise<void> => {
  try {
    await connectDB();
    await fastify.listen({ port: env.PORT, host: env.HOST });
    fastify.log.info(`🚀 DeployStream API running at http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

const handleShutdown = async (signal: string) => {
  fastify.log.info(`Received ${signal}. Shutting down gracefully...`);
  await fastify.close();
  await disconnectDB();
  process.exit(0);
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

start();
