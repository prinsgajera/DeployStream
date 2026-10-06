import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    "/health",
    {
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
    },
    async () => ({ status: "ok", timestamp: new Date().toISOString() })
  );
}

export default fp(healthRoutes, { name: "health-routes" });
