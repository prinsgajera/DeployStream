import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { upsertUserFromGitHub, fetchGitHubUser, getUserById } from "./auth.service.js";
import { authSchemas } from "./auth.schema.js";
import { env } from "../../config/env.js";

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
  fastify.get("/auth/github", {
    handler: async (request, reply) => {
      const redirectUrl = fastify.githubOAuth2.generateAuthorizationUri(request, reply);
      return reply.redirect(redirectUrl);
    },
  });

  fastify.get("/auth/github/callback", {
    handler: async (request, reply) => {
      try {
        const tokenResponse = await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
        const accessToken = tokenResponse.token.access_token as string;

        const profile = await fetchGitHubUser(accessToken);
        const user = await upsertUserFromGitHub(profile, accessToken);

        const jwt = await reply.jwtSign({ userId: user.id }, { expiresIn: "7d" });

        reply.setCookie("auth_token", jwt, {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });

        return reply.redirect(`${env.FRONTEND_URL}/dashboard`);
      } catch (err) {
        fastify.log.error(err, "GitHub OAuth callback failed");
        return reply.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
      }
    },
  });

  fastify.get("/auth/me", {
    schema: {
      response: {
        200: authSchemas.meResponse,
        401: authSchemas.errorResponse,
      },
    },
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      const user = await getUserById(request.user.userId);

      if (!user) {
        return reply.status(401).send({ error: "Unauthorized", message: "User not found" });
      }

      return reply.send(user);
    },
  });

  fastify.post("/auth/logout", {
    schema: {
      response: {
        200: authSchemas.logoutResponse,
      },
    },
    handler: async (request, reply) => {
      reply.clearCookie("auth_token", { path: "/" });
      return reply.send({ message: "Logged out successfully" });
    },
  });
}

export default fp(authRoutes, { name: "auth-routes" });
