import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
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
  const handleOAuthInitiation = async (request: FastifyRequest, reply: FastifyReply) => {
    const redirectUrl = await fastify.githubOAuth2.generateAuthorizationUri(request, reply);
    return reply.redirect(redirectUrl);
  };

  // /auth/github is registered automatically by fastifyOAuth2 (startRedirectPath).
  // We register /api/auth/github for API-consistent routing.
  fastify.get("/api/auth/github", handleOAuthInitiation);

  const handleOAuthCallback = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as { code?: string };
      const body = (request.body as { code?: string } | undefined) ?? {};
      const codeParam = query.code || body.code;

      let accessToken: string;

      if (codeParam) {
        // Exchange code directly via GitHub API
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code: codeParam,
          }),
        });

        const tokenData = (await tokenRes.json()) as { access_token?: string; error_description?: string };
        if (!tokenData.access_token) {
          throw new Error(tokenData.error_description || "Failed to retrieve access token from GitHub");
        }
        accessToken = tokenData.access_token;
      } else {
        // Fallback to fastify-oauth2 token handler
        const tokenResponse = await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
        accessToken = tokenResponse.token.access_token as string;
      }

      const profile = await fetchGitHubUser(accessToken);
      const user = await upsertUserFromGitHub(profile, accessToken);
      const userIdStr = user._id ? user._id.toString() : (user.id as string);

      const jwt = await reply.jwtSign({ userId: userIdStr }, { expiresIn: "7d" });

      reply.setCookie("auth_token", jwt, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      // If requested via JSON API (headers contain application/json), return JSON
      const acceptHeader = request.headers.accept || "";
      if (acceptHeader.includes("application/json")) {
        return reply.send({
          success: true,
          user: {
            id: userIdStr,
            githubId: user.githubId,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        });
      }

      return reply.redirect(`${env.FRONTEND_URL}/auth/callback?success=true`);
    } catch (err) {
      fastify.log.error(err, "GitHub OAuth callback failed");
      const acceptHeader = request.headers.accept || "";
      if (acceptHeader.includes("application/json")) {
        return reply.status(400).send({
          success: false,
          error: "OAuth Failed",
          message: err instanceof Error ? err.message : "Authentication failed",
        });
      }
      return reply.redirect(`${env.FRONTEND_URL}/auth/callback?error=oauth_failed`);
    }
  };

  // Support callback endpoints: /auth/github/callback, /api/auth/callback
  fastify.get("/auth/github/callback", handleOAuthCallback);
  fastify.get("/api/auth/callback", handleOAuthCallback);
  fastify.post("/api/auth/callback", handleOAuthCallback);

  const handleMe = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await getUserById(request.user.userId);
    if (!user) {
      return reply.status(401).send({ error: "Unauthorized", message: "User not found" });
    }
    return reply.send(user);
  };

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
    handleMe
  );

  fastify.get(
    "/api/auth/me",
    {
      schema: {
        response: {
          200: authSchemas.meResponse,
          401: authSchemas.errorResponse,
        },
      },
      onRequest: [fastify.authenticate],
    },
    handleMe
  );

  const handleLogout = async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie("auth_token", { path: "/" });
    return reply.send({ message: "Logged out successfully" });
  };

  fastify.post("/auth/logout", { schema: { response: { 200: authSchemas.logoutResponse } } }, handleLogout);
  fastify.post("/api/auth/logout", { schema: { response: { 200: authSchemas.logoutResponse } } }, handleLogout);
}

export default fp(authRoutes, { name: "auth-routes" });
