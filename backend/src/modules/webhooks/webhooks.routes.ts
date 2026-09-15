import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { verifyGitHubSignature, handlePushEvent } from "./webhooks.service.js";

async function webhooksRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post(
    "/api/webhooks/github",
    {
      config: { rawBody: true },
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              received: { type: "boolean" },
              triggered: { type: "boolean" },
              buildId: { type: "string" },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const signatureHeader = request.headers["x-hub-signature-256"] as string | undefined;
      const eventType = request.headers["x-github-event"] as string | undefined;
      const rawBody = (request as FastifyRequest & { rawBody?: Buffer }).rawBody;

      if (!rawBody) {
        return reply.status(400).send({ error: "Bad Request", message: "Raw body unavailable." });
      }

      if (!verifyGitHubSignature(rawBody, signatureHeader)) {
        fastify.log.warn("GitHub webhook signature verification failed");
        return reply.status(401).send({ error: "Unauthorized", message: "Invalid webhook signature." });
      }

      if (eventType !== "push") {
        return reply.send({ received: true, triggered: false });
      }

      try {
        const result = await handlePushEvent(request.body as Parameters<typeof handlePushEvent>[0]);
        return reply.send({ received: true, ...result });
      } catch (err) {
        fastify.log.error({ err }, "Failed to process GitHub push webhook");
        return reply.status(500).send({ error: "Internal Server Error", message: "Webhook processing failed." });
      }
    }
  );
}

export default fp(webhooksRoutes, { name: "webhooks-routes" });
