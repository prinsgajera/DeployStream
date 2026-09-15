import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { buildSchemas } from "./builds.schema.js";
import {
  triggerBuild,
  cancelBuild,
  syncBuildStatus,
  getBuildsForUser,
  getBuildsForRepository,
  getBuildById,
} from "./builds.service.js";
import { getLogEvents } from "../../services/cloudwatch.service.js";

interface RepoParams { repositoryId: string; }
interface BuildParams { buildId: string; }
interface TriggerBody {
  commitHash?: string;
  commitMessage?: string;
}
interface LogsQuery { nextToken?: string; }

async function buildsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    "/api/builds",
    {
      preHandler: [fastify.authenticate],
      schema: {
        response: {
          200: { type: "array", items: buildSchemas.buildResponse },
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.user as { userId: string };
      const builds = await getBuildsForUser(userId);
      return reply.send(builds.map((b) => b.toJSON()));
    }
  );

  fastify.get<{ Params: RepoParams }>(
    "/api/builds/repo/:repositoryId",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["repositoryId"],
          properties: { repositoryId: { type: "string" } },
        },
        response: {
          200: { type: "array", items: buildSchemas.buildResponse },
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.user as { userId: string };
      const { repositoryId } = request.params;
      const builds = await getBuildsForRepository(repositoryId, userId);
      return reply.send(builds.map((b) => b.toJSON()));
    }
  );

  fastify.get<{ Params: BuildParams; Querystring: LogsQuery }>(
    "/api/builds/:buildId/logs",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["buildId"],
          properties: { buildId: { type: "string" } },
        },
        querystring: {
          type: "object",
          properties: { nextToken: { type: "string" } },
        },
        response: { 200: buildSchemas.logsResponse },
      },
    },
    async (request, reply) => {
      const { userId } = request.user as { userId: string };
      const { buildId } = request.params;
      const { nextToken } = request.query;

      const build = await getBuildById(buildId, userId);
      if (!build) {
        return reply.status(404).send({ error: "Not Found", message: "Build not found." });
      }

      if (!build.logGroupName || !build.logStreamName) {
        return reply.send({ logs: [], nextToken: null });
      }

      const result = await getLogEvents(build.logGroupName, build.logStreamName, nextToken);
      return reply.send({ logs: result.events, nextToken: result.nextForwardToken });
    }
  );

  fastify.post<{ Params: RepoParams; Body: TriggerBody }>(
    "/api/builds/repo/:repositoryId/trigger",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["repositoryId"],
          properties: { repositoryId: { type: "string" } },
        },
        body: buildSchemas.triggerBuildBody,
        response: { 202: buildSchemas.buildResponse },
      },
    },
    async (request, reply) => {
      const { userId } = request.user as { userId: string };
      const { repositoryId } = request.params;
      const { commitHash, commitMessage } = request.body ?? {};

      try {
        const build = await triggerBuild({
          repositoryId,
          userId,
          triggeredBy: "manual",
          commitHash,
          commitMessage,
        });
        return reply.status(202).send(build.toJSON());
      } catch (err) {
        const error = err as NodeJS.ErrnoException;
        if (error.code === "NOT_FOUND") {
          return reply.status(404).send({ error: "Not Found", message: "Repository not found." });
        }
        fastify.log.error({ err }, "Failed to trigger build");
        return reply.status(500).send({ error: "Internal Server Error", message: "Failed to trigger build." });
      }
    }
  );

  fastify.post<{ Params: BuildParams }>(
    "/api/builds/:buildId/cancel",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["buildId"],
          properties: { buildId: { type: "string" } },
        },
        response: { 200: buildSchemas.buildResponse },
      },
    },
    async (request, reply) => {
      const { userId } = request.user as { userId: string };
      const { buildId } = request.params;

      const build = await cancelBuild(buildId, userId);
      if (!build) {
        return reply.status(404).send({ error: "Not Found", message: "Build not found." });
      }
      return reply.send(build.toJSON());
    }
  );

  fastify.get<{ Params: BuildParams }>(
    "/api/builds/:buildId/status",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["buildId"],
          properties: { buildId: { type: "string" } },
        },
        response: { 200: buildSchemas.buildResponse },
      },
    },
    async (request, reply) => {
      const { userId } = request.user as { userId: string };
      const { buildId } = request.params;

      const build = await syncBuildStatus(buildId);
      if (!build) {
        return reply.status(404).send({ error: "Not Found", message: "Build not found." });
      }

      const repo = await import("../../models/repository.model.js").then(
        (m) => m.RepositoryModel.findOne({ _id: build.repositoryId, userId })
      );
      if (!repo) {
        return reply.status(403).send({ error: "Forbidden", message: "Access denied." });
      }

      return reply.send(build.toJSON());
    }
  );
}

export default fp(buildsRoutes, { name: "builds-routes" });
