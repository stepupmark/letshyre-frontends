// What a deploy has to do, worked out from the build, the bucket and the last deploy's manifest
// without touching any of them.

import { type AppName, isAsset, MANIFEST_KEY } from "./files.ts"

export interface LocalFile {
  key: string
  path: string
  contentType: string
  cacheControl: string
  metadata: Record<string, string>
  /** Changes when the bytes or anything S3 stores with them change. */
  fingerprint: string
}

export interface RemoteObject {
  key: string
  lastModified: Date
}

/** Written to the bucket after every deploy; the edge never serves it. */
export interface Manifest {
  app: AppName
  commit: string
  deployedAt: string
  /** key → fingerprint of every file the deploy shipped */
  files: Record<string, string>
  /** asset key → when it left the build; pruned `keepAssetsDays` later */
  retired: Record<string, string>
}

export interface DeployPlan {
  /** Upload in this order, each group finished before the next starts, so a page never names a missing file. */
  phases: LocalFile[][]
  /** Keys the build dropped. Assets are never in here: an open tab may still need them. */
  remove: string[]
  /** Assets that left the build more than `keepAssetsDays` ago. */
  prune: string[]
  manifest: Manifest
  changed: boolean
}

const PHASES = ["asset", "public", "data", "html"] as const
const phaseOf = (key: string) =>
  isAsset(key) ? 0 : key.endsWith(".html") ? 3 : key.endsWith(".data") ? 2 : 1

/** Refuses a bucket that belongs to another app, or one with files but no manifest. */
export function checkBucket(
  app: AppName,
  previous: Manifest | null,
  remote: readonly RemoteObject[],
  { adopt = false } = {}
) {
  if (previous && previous.app !== app)
    throw new Error(
      `this bucket holds the ${previous.app} site, not ${app}: check BUCKET`
    )
  const files = remote.filter((object) => object.key !== MANIFEST_KEY)
  if (!previous && files.length > 0 && !adopt)
    throw new Error(
      `the bucket has ${files.length} files but no ${MANIFEST_KEY}: check BUCKET, or pass --adopt to take it over`
    )
}

/** Written before a first deploy's uploads: it lists no files, so the next deploy re-sends every page. */
export const claimManifest = (
  app: AppName,
  commit: string,
  now = new Date()
): Manifest => ({
  app,
  commit,
  deployedAt: now.toISOString(),
  files: {},
  retired: {},
})

export function planDeploy(
  app: AppName,
  local: readonly LocalFile[],
  remote: readonly RemoteObject[],
  previous: Manifest | null,
  {
    now = new Date(),
    commit = "unknown",
    keepAssetsDays = 30,
  }: { now?: Date; commit?: string; keepAssetsDays?: number } = {}
): DeployPlan {
  const objects = remote.filter((object) => object.key !== MANIFEST_KEY)
  const there = new Set(objects.map((object) => object.key))
  const here = new Set(local.map((file) => file.key))

  const upload = local.filter((file) => {
    if (!there.has(file.key)) return true
    // hashed names: the same key is the same bytes
    if (isAsset(file.key)) return false
    return previous?.files[file.key] !== file.fingerprint
  })
  const phases = PHASES.map((_, phase) =>
    upload
      .filter((file) => phaseOf(file.key) === phase)
      .sort((a, b) => a.key.localeCompare(b.key))
  ).filter((group) => group.length > 0)

  const gone = objects.filter((object) => !here.has(object.key))
  const remove = gone
    .filter((object) => !isAsset(object.key))
    .map((object) => object.key)

  const cutoff = now.getTime() - keepAssetsDays * 24 * 60 * 60 * 1000
  const retired: Record<string, string> = {}
  const prune: string[] = []
  for (const { key } of gone.filter((object) => isAsset(object.key))) {
    const since = previous?.retired[key] ?? now.toISOString()
    if (Date.parse(since) < cutoff) prune.push(key)
    else retired[key] = since
  }

  return {
    phases,
    remove,
    prune,
    changed: upload.length > 0 || remove.length > 0,
    manifest: {
      app,
      commit,
      deployedAt: now.toISOString(),
      files: Object.fromEntries(
        local.map((file) => [file.key, file.fingerprint])
      ),
      retired,
    },
  }
}
