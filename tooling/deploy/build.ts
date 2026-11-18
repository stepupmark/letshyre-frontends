// Reads an app's build into the files a deploy uploads, each with its S3 settings.

import { createHash } from "node:crypto"
import { readdirSync, readFileSync } from "node:fs"
import { join, relative, sep } from "node:path"

import { parseNginxMap } from "../csp.ts"
import {
  type AppName,
  cacheControlOf,
  contentTypeOf,
  cspRouteOf,
  isHtml,
  isSkipped,
} from "./files.ts"
import type { LocalFile } from "./plan.ts"

export type CspMode = "report-only" | "enforce"

const sha256 = (data: string | Buffer) =>
  createHash("sha256").update(data).digest("hex")

/** `buildDir` is the app's `build/`, holding `client/` and `csp.map`. */
export function readBuild(
  app: AppName,
  buildDir: string,
  cspMode: CspMode
): LocalFile[] {
  const client = join(buildDir, "client")
  const csp = parseNginxMap(readFileSync(join(buildDir, "csp.map"), "utf8"))

  return readdirSync(client, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name))
    .map((path) => ({ path, key: relative(client, path).split(sep).join("/") }))
    .filter(({ key }) => !isSkipped(app, key))
    .map(({ path, key }) => {
      const contentType = contentTypeOf(key)
      const cacheControl = cacheControlOf(key)
      const route = cspRouteOf(app, key)
      const policy = route ? csp.policies.get(route) : csp.fallback
      if (isHtml(key) && !policy)
        throw new Error(
          `${key}: no policy for ${route ?? "the fallback"} in csp.map`
        )
      const metadata: Record<string, string> =
        isHtml(key) && policy ? { csp: policy, "csp-mode": cspMode } : {}
      const fingerprint = sha256(
        [
          sha256(readFileSync(path)),
          contentType,
          cacheControl,
          JSON.stringify(metadata),
        ].join("\n")
      )
      return { key, path, contentType, cacheControl, metadata, fingerprint }
    })
}
