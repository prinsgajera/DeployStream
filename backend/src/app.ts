import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyOAuth2, { type OAuth2Namespace } from "@fastify/oauth2";
import fastifyRawBody from "fastify-raw-body";
import { env } from "./config/env.js";
import { API_PREFIX } from "./config/constants.js";
import { apiRoutes } from "./routes/index.js";
import authPlugin from "./plugins/auth.plugin.js";

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
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  await fastify.register(fastifyCookie);

  await fastify.register(fastifyOAuth2, {
    name: "githubOAuth2",
    scope: ["read:user", "user:email", "repo"],
    credentials: {
      client: {
        id: env.GITHUB_CLIENT_ID,
        secret: env.GITHUB_CLIENT_SECRET,
      },
      auth: fastifyOAuth2.GITHUB_CONFIGURATION,
    },
    callbackUri: env.GITHUB_CALLBACK_URL,
  });

  await fastify.register(fastifyRawBody, {
    field: "rawBody",
    global: false,
    encoding: false,
    runFirst: true,
  });

  await fastify.register(authPlugin);
  await fastify.register(apiRoutes, { prefix: API_PREFIX });
}

export default fp(app, { name: "app" });
