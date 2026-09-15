import { Type } from "@sinclair/typebox";

const buildStatusEnum = Type.Union([
  Type.Literal("IDLE"),
  Type.Literal("QUEUED"),
  Type.Literal("BUILDING"),
  Type.Literal("SUCCESS"),
  Type.Literal("FAILED"),
  Type.Literal("CANCELLED"),
]);

const buildResponse = Type.Object({
  id: Type.String(),
  repositoryId: Type.String(),
  status: buildStatusEnum,
  triggeredBy: Type.Union([Type.Literal("webhook"), Type.Literal("manual")]),
  commitHash: Type.Union([Type.String(), Type.Null()]),
  commitMessage: Type.Union([Type.String(), Type.Null()]),
  commitAuthor: Type.Union([Type.String(), Type.Null()]),
  branch: Type.Union([Type.String(), Type.Null()]),
  awsCodeBuildId: Type.Union([Type.String(), Type.Null()]),
  logGroupName: Type.Union([Type.String(), Type.Null()]),
  logStreamName: Type.Union([Type.String(), Type.Null()]),
  startedAt: Type.String(),
  endedAt: Type.Union([Type.String(), Type.Null()]),
  durationSeconds: Type.Union([Type.Number(), Type.Null()]),
  deployedUrl: Type.Union([Type.String(), Type.Null()]),
  errorMessage: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.Optional(Type.String()),
  updatedAt: Type.Optional(Type.String()),
});

const triggerBuildBody = Type.Object({
  commitHash: Type.Optional(Type.String()),
  commitMessage: Type.Optional(Type.String()),
});

const logLineResponse = Type.Object({
  message: Type.String(),
  timestamp: Type.Number(),
});

const logsResponse = Type.Object({
  logs: Type.Array(logLineResponse),
  nextToken: Type.Union([Type.String(), Type.Null()]),
});

export const buildSchemas = {
  buildResponse,
  triggerBuildBody,
  logsResponse,
};
