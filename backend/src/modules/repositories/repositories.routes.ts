import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import {
  fetchUserGitHubRepos,
  importRepository,
  getUserRepositories,
  deleteUserRepository,
  updateAutoDeployStatus,
  type ImportRepositoryPayload,
} from "./repositories.service.js";
import { repositorySchemas } from "./repositories.schema.js";

interface ImportBody {
  githubRepoId: string;
  repoName: string;
  fullName: string;
  subdomain: string;
  branch: string;
  framework: string;
  buildCommand: string;
  outputDirectory: string;
  envVars: Array<{ key: string; value: string; isSecret: boolean }>;
}

interface RepoParams {
  id: string;
}

interface PatchAutoDeployBody {
  autoDeploy: boolean;
}

async function repositoriesRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    "/api/github/repos",
    {
      preHandler: [fastify.authenticate],
      schema: {
        response: { 200: repositorySchemas.listGitHubReposResponse },
      },
    },
    async (request, reply) => {
      const { userId } = request.user as { userId: string };
      try {
        const repos = await fetchUserGitHubRepos(userId);
        return reply.send(repos);
      } catch (err) {
        const error = err as Error;
        fastify.log.error({ err }, "Failed to fetch GitHub repositories");
        return reply.status(502).send({
          error: "Bad Gateway",
          message: error.message,
        });
      }
    }
  );

  fastify.post<{ Body: ImportBody }>(
    "/api/repositories/import",
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: repositorySchemas.importBodySchema,
        response: { 201: repositorySchemas.repositoryResponse },
      },
    },
    async (request, reply) => {
      const { userId } = request.user as { userId: string };
      const payload = request.body as ImportRepositoryPayload;

      try {
        const repository = await importRepository(userId, payload);
        return reply.status(201).send(repository.toJSON());
      } catch (err) {
        const error = err as NodeJS.ErrnoException;

        if (error.code === "REPO_CONFLICT") {
          return reply.status(409).send({
            error: "Conflict",
            message: "This repository has already been imported.",
          });
        }

        if (error.code === "SUBDOMAIN_CONFLICT") {
          return reply.status(409).send({
            error: "Conflict",
            message: "This subdomain is already taken. Please choose another.",
          });
        }

        fastify.log.error({ err }, "Failed to import repository");
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Failed to import repository.",
        });
      }
    }
  );

  fastify.get(
    "/api/repositories",
    {
      preHandler: [fastify.authenticate],
      schema: {
        response: {
          200: {
            type: "array",
            items: repositorySchemas.repositoryResponse,
          },
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.user as { userId: string };
      try {
        const repos = await getUserRepositories(userId);
        return reply.send(repos.map((r) => r.toJSON()));
      } catch (err) {
        fastify.log.error({ err }, "Failed to fetch user repositories");
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Failed to fetch repositories.",
        });
      }
    }
  );

  fastify.delete<{ Params: RepoParams }>(
    "/api/repositories/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
        response: { 204: { type: "null" } },
      },
    },
    async (request, reply) => {
      const { userId } = request.user as { userId: string };
      const { id } = request.params;

      try {
        const deleted = await deleteUserRepository(userId, id);
        if (!deleted) {
          return reply.status(404).send({
            error: "Not Found",
            message: "Repository not found.",
          });
        }
        return reply.status(204).send();
      } catch (err) {
        fastify.log.error({ err }, "Failed to delete repository");
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Failed to delete repository.",
        });
      }
    }
  );
  fastify.patch<{ Params: RepoParams; Body: PatchAutoDeployBody }>(
    "/api/repositories/:id/auto-deploy",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
        },
        body: repositorySchemas.patchAutoDeployBody,
        response: { 200: repositorySchemas.repositoryResponse },
      },
    },
    async (request, reply) => {
      const { userId } = request.user as { userId: string };
      const { id } = request.params;
      const { autoDeploy } = request.body;

      try {
        const updated = await updateAutoDeployStatus(userId, id, autoDeploy);
        if (!updated) {
          return reply.status(404).send({
            error: "Not Found",
            message: "Repository not found.",
          });
        }
        return reply.send(updated.toJSON());
      } catch (err) {
        fastify.log.error({ err }, "Failed to update auto-deploy status");
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Failed to update auto-deploy status.",
        });
      }
    }
  );
}

export default fp(repositoriesRoutes, { name: "repositories-routes" });
