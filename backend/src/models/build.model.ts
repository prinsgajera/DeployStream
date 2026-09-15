import { Schema, model, type Document, type Model, Types } from "mongoose";

export enum BuildStatus {
  IDLE = "IDLE",
  QUEUED = "QUEUED",
  BUILDING = "BUILDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export type BuildTrigger = "webhook" | "manual";

export interface IBuild {
  id?: string;
  repositoryId: Types.ObjectId;
  status: BuildStatus;
  triggeredBy: BuildTrigger;
  commitHash: string | null;
  commitMessage: string | null;
  commitAuthor: string | null;
  branch: string | null;
  awsCodeBuildId: string | null;
  logGroupName: string | null;
  logStreamName: string | null;
  startedAt: Date;
  endedAt: Date | null;
  durationSeconds: number | null;
  deployedUrl: string | null;
  errorMessage: string | null;
}

export type IBuildDocument = IBuild & Document;

const buildSchema = new Schema<IBuildDocument>(
  {
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(BuildStatus),
      default: BuildStatus.QUEUED,
      index: true,
    },
    triggeredBy: {
      type: String,
      enum: ["webhook", "manual"] as const,
      required: true,
    },
    commitHash: { type: String, default: null },
    commitMessage: { type: String, default: null },
    commitAuthor: { type: String, default: null },
    branch: { type: String, default: null },
    awsCodeBuildId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      index: true,
    },
    logGroupName: { type: String, default: null },
    logStreamName: { type: String, default: null },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: null },
    deployedUrl: { type: String, default: null },
    errorMessage: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret["id"] = ret["_id"] ? String(ret["_id"]) : undefined;
        delete ret["_id"];
        delete ret["__v"];
        return ret;
      },
    },
  }
);

export const BuildModel: Model<IBuildDocument> =
  model<IBuildDocument>("Build", buildSchema);
