import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { env } from "../config/env.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

async function authPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: "auth_token",
      signed: false,
    },
  });

  fastify.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const tokenInCookie = request.cookies?.["auth_token"];
      const tokenInHeader = request.headers.authorization;

      if (!tokenInCookie && !tokenInHeader) {
        return reply.status(401).send({
          error: "Unauthorized",
          message: "No authentication token provided",
        });
      }

      try {
        await request.jwtVerify();
      } catch {
        return reply.status(401).send({
          error: "Unauthorized",
          message: "Invalid or expired session",
        });
      }
    }
  );
}

export default fp(authPlugin, { name: "auth-plugin" });
