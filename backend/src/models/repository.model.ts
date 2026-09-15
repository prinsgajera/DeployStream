import { Schema, model, type Document, type Model, Types } from "mongoose";

export interface IEnvVar {
  key: string;
  value: string;
  isSecret: boolean;
}

export interface IRepository {
  id?: string;
  userId: Types.ObjectId;
  repoName: string;
  fullName: string;
  githubRepoId: string;
  subdomain: string;
  branch: string;
  framework: string;
  buildCommand: string;
  outputDirectory: string;
  envVars: IEnvVar[];
  webhookId?: string | null;
  isActive: boolean;
  autoDeploy: boolean;
  s3BucketUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IRepositoryDocument = IRepository & Document;

const envVarSchema = new Schema<IEnvVar>(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
    isSecret: { type: Boolean, default: false },
  },
  { _id: false }
);

const repositorySchema = new Schema<IRepositoryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    repoName: { type: String, required: true },
    fullName: { type: String, required: true, unique: true },
    githubRepoId: { type: String, required: true, unique: true, index: true },
    subdomain: { type: String, required: true, unique: true, index: true },
    branch: { type: String, required: true, default: "main" },
    framework: { type: String, required: true, default: "React / Vite" },
    buildCommand: { type: String, required: true, default: "npm run build" },
    outputDirectory: { type: String, required: true, default: "dist" },
    envVars: { type: [envVarSchema], default: [] },
    webhookId: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    autoDeploy: { type: Boolean, default: true },
    s3BucketUrl: { type: String, default: null },
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

export const RepositoryModel: Model<IRepositoryDocument> =
  model<IRepositoryDocument>("Repository", repositorySchema);
