import { z } from "zod"

import { unwrap } from "../envelope.ts"
import type { HttpClient } from "../http.ts"

export type DesktopOs = "windows" | "mac"

const releaseSchema = z
  .object({
    platform: z.string().transform((p) => p.toLowerCase()),
    available: z.boolean().default(false),
    version: z.string().nullish(),
    original_filename: z.string().nullish(),
  })
  .transform((r) => ({
    platform: r.platform,
    available: r.available,
    version: r.version ?? null,
    filename: r.original_filename ?? null,
  }))

export type DesktopRelease = z.output<typeof releaseSchema>

const readReleases = unwrap(
  z.union([z.array(releaseSchema), releaseSchema.transform((r) => [r])])
)

/** `null` when there's no build for that OS yet. */
export async function getLatestRelease(
  client: HttpClient,
  os: DesktopOs,
  { signal }: { signal?: AbortSignal } = {}
): Promise<DesktopRelease | null> {
  const releases = readReleases(
    await client.get(`/commonapp/v1/desktop_app/${os}/latest/`, { signal })
  )
  return releases.find((r) => r.platform === os) ?? null
}

/** The installer is served straight from the API, so the browser downloads it with a plain link. */
export function desktopDownloadUrl(baseUrl: string, os: DesktopOs): string {
  return new URL(
    `commonapp/v1/desktop_app/${os}/download/`,
    baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  ).href
}
