const githubRepoItemSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    name: { type: "string" },
    full_name: { type: "string" },
    private: { type: "boolean" },
    default_branch: { type: "string" },
    updated_at: { type: "string" },
    language: { type: ["string", "null"] },
    description: { type: ["string", "null"] },
  },
} as const;

const errorResponseSchema = {
  type: "object",
  required: ["error", "message"],
  properties: {
    error: { type: "string" },
    message: { type: "string" },
  },
} as const;

export const repositorySchemas = {
  errorResponse: errorResponseSchema,

  listGitHubReposResponse: {
    type: "array",
    items: githubRepoItemSchema,
  },

  importBodySchema: {
    type: "object",
    required: [
      "githubRepoId",
      "repoName",
      "fullName",
      "subdomain",
      "branch",
      "framework",
      "buildCommand",
      "outputDirectory",
    ],
    properties: {
      githubRepoId: { type: "string" },
      repoName: { type: "string" },
      fullName: { type: "string" },
      subdomain: {
        type: "string",
        pattern: "^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$",
        minLength: 3,
        maxLength: 63,
      },
      branch: { type: "string" },
      framework: { type: "string" },
      buildCommand: { type: "string" },
      outputDirectory: { type: "string" },
      envVars: {
        type: "array",
        items: {
          type: "object",
          required: ["key", "value", "isSecret"],
          properties: {
            key: { type: "string" },
            value: { type: "string" },
            isSecret: { type: "boolean" },
          },
        },
        default: [],
      },
    },
  },

  repositoryResponse: {
    type: "object",
    properties: {
      id: { type: "string" },
      userId: { type: "string" },
      repoName: { type: "string" },
      fullName: { type: "string" },
      githubRepoId: { type: "string" },
      subdomain: { type: "string" },
      branch: { type: "string" },
      framework: { type: "string" },
      buildCommand: { type: "string" },
      outputDirectory: { type: "string" },
      isActive: { type: "boolean" },
      autoDeploy: { type: "boolean" },
      s3BucketUrl: { type: ["string", "null"] },
      deployedUrl: { type: ["string", "null"] },
      lastDeployedAt: { type: ["string", "null"] },
      totalBuilds: { type: "number" },
      successfulBuilds: { type: "number" },
      envVars: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            value: { type: "string" },
            isSecret: { type: "boolean" },
          },
        },
      },
      createdAt: { type: "string" },
      updatedAt: { type: "string" },
    },
  },

  patchSettingsBody: {
    type: "object",
    minProperties: 1,
    additionalProperties: false,
    properties: {
      branch: { type: "string", minLength: 1 },
      framework: { type: "string", minLength: 1 },
      buildCommand: { type: "string", minLength: 1 },
      outputDirectory: { type: "string", minLength: 1 },
      envVars: {
        type: "array",
        items: {
          type: "object",
          required: ["key", "value", "isSecret"],
          additionalProperties: false,
          properties: {
            key: { type: "string", pattern: "^[A-Za-z_][A-Za-z0-9_]*$" },
            value: { type: "string" },
            isSecret: { type: "boolean" },
          },
        },
      },
    },
  },

  subdomainAvailabilityQuery: {
    type: "object",
    required: ["subdomain"],
    properties: {
      subdomain: { type: "string", maxLength: 100 },
      excludeRepositoryId: { type: "string" },
    },
  },

  subdomainAvailabilityResponse: {
    type: "object",
    properties: {
      available: { type: "boolean" },
      reason: { type: "string", enum: ["invalid", "reserved", "taken"] },
      suggestions: { type: "array", items: { type: "string" } },
    },
  },

  patchSubdomainBody: {
    type: "object",
    required: ["subdomain"],
    additionalProperties: false,
    properties: { subdomain: { type: "string", maxLength: 100 } },
  },

  patchAutoDeployBody: {
    type: "object",
    required: ["autoDeploy"],
    properties: {
      autoDeploy: { type: "boolean" },
    },
  },
};
