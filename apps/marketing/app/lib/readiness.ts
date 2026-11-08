import { join } from "node:path"
import type { Locale } from "@workspace/i18n"
import { computeReadiness } from "@workspace/i18n/node"

import {
  type Post,
  postPath,
  publishedPosts,
  withBlogIndex,
} from "./blog/post.ts"
import { readPosts } from "./blog/read-posts.ts"
import { PAGES, type PageId, pageNamespaces, withoutReplaced } from "./pages.ts"

const LOCALES_DIR = "app/locales"
export const BLOG_DIR = "content/blog"

/** Build-time only: the locales each page ships in, and the posts that ship. `root` is the app's. */
export function readiness(root: string): {
  pages: Map<PageId, Locale[]>
  posts: Post[]
} {
  const pages = withoutReplaced(
    computeReadiness({
      localesDir: join(root, LOCALES_DIR),
      pages: Object.fromEntries(
        Object.keys(PAGES).map((id) => [id, pageNamespaces(id as PageId)])
      ),
    }) as Map<PageId, Locale[]>
  )
  const posts = publishedPosts(
    readPosts(join(root, BLOG_DIR)),
    pages.get("blog") ?? []
  )
  return { pages: withBlogIndex(pages, posts), posts }
}

/** Every `/<lang><path>` whose catalogs are complete, and every post. */
export function readyPaths(root: string): string[] {
  const { pages, posts } = readiness(root)
  return [
    ...[...pages].flatMap(([id, locales]) =>
      locales.map((lang) => `/${lang}${PAGES[id].path}`)
    ),
    ...posts.map((post) => `/${post.lang}${postPath(post.slug)}`),
  ]
}
