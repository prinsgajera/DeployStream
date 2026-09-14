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

export const repositorySchemas = {
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
        pattern: "^[a-z0-9-]+$",
        minLength: 2,
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
      s3BucketUrl: { type: ["string", "null"] },
      createdAt: { type: "string" },
      updatedAt: { type: "string" },
    },
  },
};
