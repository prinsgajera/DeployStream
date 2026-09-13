export const authSchemas = {
  meResponse: {
    type: "object",
    properties: {
      id: { type: "string" },
      githubId: { type: "string" },
      username: { type: "string" },
      firstName: { type: "string", nullable: true },
      lastName: { type: "string", nullable: true },
      email: { type: "string", nullable: true },
      avatarUrl: { type: "string", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
    required: ["id", "githubId", "username", "createdAt", "updatedAt"],
  },

  logoutResponse: {
    type: "object",
    properties: {
      message: { type: "string" },
    },
    required: ["message"],
  },

  errorResponse: {
    type: "object",
    properties: {
      error: { type: "string" },
      message: { type: "string" },
    },
    required: ["error", "message"],
  },
} as const;
