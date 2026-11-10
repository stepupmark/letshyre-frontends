import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { parsePosts, type Post } from "./post.ts"

/** Build-time only. */
export function readPosts(contentDir: string, previews: boolean): Post[] {
  if (!existsSync(contentDir)) return []
  const files = readdirSync(contentDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((dir) =>
      readdirSync(join(contentDir, dir.name))
        .filter((name) => name.endsWith(".mdx"))
        .map((name) => join(contentDir, dir.name, name))
    )
  return parsePosts(
    files.map((file) => [file, readFileSync(file, "utf8")] as const),
    previews
  )
}
