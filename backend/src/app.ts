import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import fastifyOAuth2, { type OAuth2Namespace } from "@fastify/oauth2";
import { env } from "./config/env.js";
import authPlugin from "./plugins/auth.plugin.js";
import authRoutes from "./modules/auth/auth.routes.js";

declare module "fastify" {
  interface FastifyInstance {
    githubOAuth2: OAuth2Namespace;
  }
}

async function app(fastify: FastifyInstance): Promise<void> {
  await fastify.register(fastifyCors, {
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  });

  await fastify.register(fastifyOAuth2, {
    name: "githubOAuth2",
    scope: ["read:user", "user:email"],
    credentials: {
      client: {
        id: env.GITHUB_CLIENT_ID,
        secret: env.GITHUB_CLIENT_SECRET,
      },
      auth: fastifyOAuth2.GITHUB_CONFIGURATION,
    },
    startRedirectPath: "/auth/github",
    callbackUri: env.GITHUB_CALLBACK_URL,
  });

  await fastify.register(authPlugin);
  await fastify.register(authRoutes);
}

export default fp(app, { name: "app" });
