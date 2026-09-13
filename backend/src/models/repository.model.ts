import { Schema, model, type Document, type Model, Types } from "mongoose";

export interface IRepository {
  id?: string;
  userId: Types.ObjectId;
  repoName: string;
  fullName: string;
  githubRepoId: string;
  webhookId?: string | null;
  isActive: boolean;
  s3BucketUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IRepositoryDocument = IRepository & Document;

const repositorySchema = new Schema<IRepositoryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    repoName: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      unique: true,
    },
    githubRepoId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    webhookId: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    s3BucketUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
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

export const RepositoryModel: Model<IRepositoryDocument> =
  model<IRepositoryDocument>("Repository", repositorySchema);
