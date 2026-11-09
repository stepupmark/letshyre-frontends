import { join } from "node:path"
import type { Locale } from "@workspace/i18n"
import { computeReadiness } from "@workspace/i18n/node"

import { postPath, topicPath } from "./blog/paths.ts"
import {
  type Post,
  publishedPosts,
  topicsOf,
  withBlogIndex,
} from "./blog/post.ts"
import { readPosts } from "./blog/read-posts.ts"
import { PAGES, type PageId, pageNamespaces, withoutReplaced } from "./pages.ts"

const LOCALES_DIR = "app/locales"
export const BLOG_DIR = "content/blog"

/** Build-time only: the locales each page ships in, and the posts that ship. `root` is the app's. */
export function readiness(
  root: string,
  previews = false
): {
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
    readPosts(join(root, BLOG_DIR), previews),
    pages.get("blog") ?? []
  )
  return { pages: withBlogIndex(pages, posts), posts }
}

/** Each locale's blog topics that have a post, as `/<lang>` and topic. */
export const topicPages = (posts: readonly Post[]) =>
  [...new Set(posts.map((post) => post.lang))].flatMap((lang) =>
    topicsOf(posts.filter((post) => post.lang === lang)).map((topic) => ({
      lang,
      topic,
    }))
  )

/** Every `/<lang><path>` whose catalogs are complete, every post and every topic page. */
export function readyPaths(root: string, previews = false): string[] {
  const { pages, posts } = readiness(root, previews)
  return [
    ...[...pages].flatMap(([id, locales]) =>
      locales.map((lang) => `/${lang}${PAGES[id].path}`)
    ),
    ...posts.map((post) => `/${post.lang}${postPath(post.slug)}`),
    ...topicPages(posts).map(
      ({ lang, topic }) => `/${lang}${topicPath(topic)}`
    ),
  ]
}
