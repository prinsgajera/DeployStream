import { Schema, model, type Document, type Model, Types } from "mongoose";

export enum BuildStatus {
  IDLE = "IDLE",
  QUEUED = "QUEUED",
  BUILDING = "BUILDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface IBuild {
  id?: string;
  repositoryId: Types.ObjectId;
  status: BuildStatus;
  commitHash?: string | null;
  commitMessage?: string | null;
  awsCodeBuildId?: string | null;
  startedAt?: Date;
  endedAt?: Date | null;
  logsUrl?: string | null;
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
      default: BuildStatus.IDLE,
    },
    commitHash: {
      type: String,
      default: null,
    },
    commitMessage: {
      type: String,
      default: null,
    },
    awsCodeBuildId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    logsUrl: {
      type: String,
      default: null,
    },
  },
  {
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret['id'] = ret['_id'] ? String(ret['_id']) : undefined;
        delete ret['_id'];
        delete ret['__v'];
        return ret;
      },
    },
  }
);

export const BuildModel: Model<IBuildDocument> =
  model<IBuildDocument>("Build", buildSchema);
