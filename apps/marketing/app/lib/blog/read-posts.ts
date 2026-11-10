import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { parseGuide, parseTerm, type Guide, type Term } from "./glossary.ts"
import { parsePosts, type Post } from "./post.ts"

/** Every `<dir>/<name>/<lang>.mdx`, as `[path, source]`. Build-time only. */
function mdxFiles(contentDir: string): [string, string][] {
  if (!existsSync(contentDir)) return []
  return readdirSync(contentDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((dir) =>
      readdirSync(join(contentDir, dir.name))
        .filter((name) => name.endsWith(".mdx"))
        .map((name) => join(contentDir, dir.name, name))
    )
    .map((file) => [file, readFileSync(file, "utf8")])
}

export const readPosts = (contentDir: string, previews: boolean): Post[] =>
  parsePosts(mdxFiles(contentDir), previews)

export const readTerms = (contentDir: string): Term[] =>
  mdxFiles(contentDir).map(([file, source]) => parseTerm(file, source))

export const readGuides = (contentDir: string): Guide[] =>
  mdxFiles(contentDir).map(([file, source]) => parseGuide(file, source))
