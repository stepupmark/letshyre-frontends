// The S3 and CloudFront calls a deploy makes. Credentials and region come from the environment
// (the GitHub job assumes its role through OIDC).

import { readFileSync } from "node:fs"
import {
  CloudFrontClient,
  CreateInvalidationCommand,
  waitUntilInvalidationCompleted,
} from "@aws-sdk/client-cloudfront"
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  NoSuchKey,
  paginateListObjectsV2,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"

import { MANIFEST_KEY } from "./files.ts"
import { eachLimited } from "./limit.ts"
import type { LocalFile, Manifest, RemoteObject } from "./plan.ts"

const s3 = new S3Client({})
const cloudfront = new CloudFrontClient({})

export async function listBucket(bucket: string): Promise<RemoteObject[]> {
  const objects: RemoteObject[] = []
  for await (const page of paginateListObjectsV2(
    { client: s3 },
    { Bucket: bucket }
  )) {
    for (const item of page.Contents ?? []) {
      if (item.Key && item.LastModified)
        objects.push({ key: item.Key, lastModified: item.LastModified })
    }
  }
  return objects
}

export async function readManifest(bucket: string): Promise<Manifest | null> {
  try {
    const { Body } = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: MANIFEST_KEY })
    )
    return JSON.parse((await Body?.transformToString()) ?? "null") as Manifest
  } catch (error) {
    if (error instanceof NoSuchKey) return null
    throw error
  }
}

export async function writeManifest(bucket: string, manifest: Manifest) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: MANIFEST_KEY,
      Body: JSON.stringify(manifest),
      ContentType: "application/json",
      CacheControl: "no-store",
    })
  )
}

export async function upload(bucket: string, files: readonly LocalFile[]) {
  await eachLimited(files, 16, async (file) => {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: file.key,
        Body: readFileSync(file.path),
        ContentType: file.contentType,
        CacheControl: file.cacheControl,
        Metadata: file.metadata,
      })
    )
  })
}

export async function remove(bucket: string, keys: readonly string[]) {
  for (let i = 0; i < keys.length; i += 1000) {
    const result = await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: keys.slice(i, i + 1000).map((Key) => ({ Key })),
          Quiet: true,
        },
      })
    )
    if (result.Errors?.length)
      throw new Error(
        `delete failed: ${result.Errors.map((e) => `${e.Key} ${e.Code}`).join(", ")}`
      )
  }
}

export async function invalidateAll(distributionId: string) {
  const { Invalidation } = await cloudfront.send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `deploy-${Date.now()}`,
        Paths: { Quantity: 1, Items: ["/*"] },
      },
    })
  )
  if (!Invalidation?.Id)
    throw new Error("CloudFront returned no invalidation id")
  await waitUntilInvalidationCompleted(
    { client: cloudfront, maxWaitTime: 900 },
    { DistributionId: distributionId, Id: Invalidation.Id }
  )
  return Invalidation.Id
}
