import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { isLive, parsePost, type Post } from "./post.ts"

/** Build-time only. Drafts and future posts never ship. */
export function readPosts(contentDir: string): Post[] {
  if (!existsSync(contentDir)) return []
  return readdirSync(contentDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((dir) =>
      readdirSync(join(contentDir, dir.name))
        .filter((name) => name.endsWith(".mdx"))
        .map((name) => {
          const file = join(contentDir, dir.name, name)
          return parsePost(file, readFileSync(file, "utf8"))
        })
    )
    .filter((post) => isLive(post))
}
