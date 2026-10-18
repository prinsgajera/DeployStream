import {
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
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

const COPY_CONCURRENCY = 10;

async function listKeys(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const listing = await client.send(
      new ListObjectsV2Command({
        Bucket: env.S3_BUILDS_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );
    (listing.Contents ?? []).forEach((object) => {
      if (object.Key) keys.push(object.Key);
    });
    continuationToken = listing.IsTruncated ? listing.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

function encodeCopySource(key: string): string {
  return [env.S3_BUILDS_BUCKET, ...key.split("/").map(encodeURIComponent)].join("/");
}

export async function copySiteFiles(fromSubdomain: string, toSubdomain: string): Promise<number> {
  const fromPrefix = buildS3KeyPrefix(fromSubdomain);
  const toPrefix = buildS3KeyPrefix(toSubdomain);

  await deleteSiteFiles(toSubdomain);
  const keys = await listKeys(fromPrefix);

  try {
    for (let start = 0; start < keys.length; start += COPY_CONCURRENCY) {
      await Promise.all(
        keys.slice(start, start + COPY_CONCURRENCY).map((key) =>
          client.send(
            new CopyObjectCommand({
              Bucket: env.S3_BUILDS_BUCKET,
              CopySource: encodeCopySource(key),
              Key: `${toPrefix}${key.slice(fromPrefix.length)}`,
            })
          )
        )
      );
    }
  } catch (err) {
    await deleteSiteFiles(toSubdomain);
    throw err;
  }

  return keys.length;
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
