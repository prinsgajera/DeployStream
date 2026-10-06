import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { upsertUserFromGitHub, fetchGitHubUser, getUserById } from "./auth.service.js";
import { authSchemas } from "./auth.schema.js";
import { env } from "../../config/env.js";
import {
  AUTH_COOKIE_NAME,
  AUTH_TOKEN_TTL_SECONDS,
} from "../../config/constants.js";

interface JwtPayload {
  userId: string;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

async function authRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/auth/github", async (request: FastifyRequest, reply: FastifyReply) => {
    const redirectUrl = await fastify.githubOAuth2.generateAuthorizationUri(request, reply);
    return reply.redirect(redirectUrl);
  });

  fastify.get("/auth/github/callback", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { token } = await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
      const profile = await fetchGitHubUser(token.access_token);
      const user = await upsertUserFromGitHub(profile, token.access_token);

      const jwt = await reply.jwtSign(
        { userId: String(user._id) },
        { expiresIn: AUTH_TOKEN_TTL_SECONDS }
      );

      reply.setCookie(AUTH_COOKIE_NAME, jwt, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: AUTH_TOKEN_TTL_SECONDS,
      });

      return reply.redirect(`${env.FRONTEND_URL}/auth/callback#token=${encodeURIComponent(jwt)}`);
    } catch (err) {
      fastify.log.error({ err }, "GitHub OAuth callback failed");
      return reply.redirect(`${env.FRONTEND_URL}/auth/callback?error=oauth_failed`);
    }
  });

  fastify.get(
    "/auth/me",
    {
      schema: {
        response: {
          200: authSchemas.meResponse,
          401: authSchemas.errorResponse,
        },
      },
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const user = await getUserById(request.user.userId);
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized", message: "User not found" });
      }
      return reply.send(user);
    }
  );

  fastify.post(
    "/auth/logout",
    { schema: { response: { 200: authSchemas.logoutResponse } } },
    async (_request, reply) => {
      reply.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
      return reply.send({ message: "Logged out successfully" });
    }
  );
}

export default fp(authRoutes, { name: "auth-routes" });
