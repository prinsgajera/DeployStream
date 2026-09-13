import { Schema, model, type Document, type Model } from "mongoose";

export interface IUser {
  id?: string;
  githubId: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  githubToken: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IUserDocument = IUser & Document;

const userSchema = new Schema<IUserDocument>(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      default: null,
    },
    lastName: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    githubToken: {
      type: String,
      required: true,
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

export const UserModel: Model<IUserDocument> =
  model<IUserDocument>("User", userSchema);
