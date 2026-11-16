import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { type Locale, localePath } from "@workspace/i18n"

import { postPath } from "../app/lib/blog/paths.ts"

// the blog's own pages under /blogs, which aren't posts
const BLOG_PAGES = new Set(["topics", "tags", "page", "glossary"])

/**
 * Post pages the build prerendered that the blog model doesn't list. Any means the prerender list
 * and the loaders saw different posts.
 */
export function strayPostPages(
  clientDir: string,
  langs: readonly Locale[],
  pages: ReadonlySet<string>
): string[] {
  return langs.flatMap((lang) => {
    const dir = join(clientDir, lang, "blogs")
    if (!existsSync(dir)) return []
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !BLOG_PAGES.has(entry.name))
      .map((entry) => localePath(lang, postPath(entry.name)))
      .filter(
        (route) =>
          existsSync(join(clientDir, route, "index.html")) && !pages.has(route)
      )
      .map(
        (route) =>
          `${route}: prerendered but not in the blog model; the prerender list and loaders disagree`
      )
  })
}
