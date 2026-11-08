import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { parsePost, type Post, visiblePosts } from "./post.ts"

/** Build-time only. */
export function readPosts(contentDir: string, previews: boolean): Post[] {
  if (!existsSync(contentDir)) return []
  return visiblePosts(
    readdirSync(contentDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((dir) =>
        readdirSync(join(contentDir, dir.name))
          .filter((name) => name.endsWith(".mdx"))
          .map((name) => {
            const file = join(contentDir, dir.name, name)
            return parsePost(file, readFileSync(file, "utf8"))
          })
      ),
    previews
  )
}
