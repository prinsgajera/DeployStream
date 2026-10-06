import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
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

const DELETE_BATCH_SIZE = 1000;

export async function deleteSiteFiles(subdomain: string): Promise<number> {
  const prefix = buildS3KeyPrefix(subdomain);
  let continuationToken: string | undefined;
  let deletedCount = 0;

  do {
    const listing = await client.send(
      new ListObjectsV2Command({
        Bucket: env.S3_BUILDS_BUCKET,
        Prefix: prefix,
        MaxKeys: DELETE_BATCH_SIZE,
        ContinuationToken: continuationToken,
      })
    );

    const keys = (listing.Contents ?? []).flatMap((object) => (object.Key ? [{ Key: object.Key }] : []));
    if (keys.length > 0) {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: env.S3_BUILDS_BUCKET,
          Delete: { Objects: keys, Quiet: true },
        })
      );
      deletedCount += keys.length;
    }

    continuationToken = listing.IsTruncated ? listing.NextContinuationToken : undefined;
  } while (continuationToken);

  return deletedCount;
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
