import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_CALLBACK_URL: z.string().url(),
  GITHUB_WEBHOOK_SECRET: z.string().min(1),

  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().length(32),
  FRONTEND_URL: z.string().url().default("http://localhost:4000"),

  AWS_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),

  CODEBUILD_PROJECT_NAME: z.string().min(1),
  S3_BUILDS_BUCKET: z.string().min(1),
  CLOUDWATCH_LOG_GROUP: z.string().min(1),

  DEPLOYED_BASE_DOMAIN: z.string().min(1),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof EnvSchema>;

