import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

const client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export function buildS3KeyPrefix(subdomain: string): string {
  return `builds/${subdomain}/`;
}

export function buildDeployedUrl(subdomain: string): string {
  return `https://${subdomain}.${env.DEPLOYED_BASE_DOMAIN}`;
}

export async function uploadObject(
  key: string,
  body: Buffer | string,
  contentType: string
): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUILDS_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}
