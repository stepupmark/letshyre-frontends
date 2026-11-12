import { join } from "node:path"
import { LOCALES, type Locale } from "@workspace/i18n"
import { computeReadiness } from "@workspace/i18n/node"

import type { Term } from "./blog/glossary.ts"
import { publishedPosts, TOPICS, withBlogIndex } from "./blog/list.ts"
import { feedPath, searchIndexPath, topicPath } from "./blog/paths.ts"
import type { Post } from "./blog/post.ts"
import { readPosts, readTerms } from "./blog/read-posts.ts"
import { type BlogRoute, blogRoutes } from "./blog/routes.ts"
import { PAGES, type PageId, pageNamespaces, withoutReplaced } from "./pages.ts"

const LOCALES_DIR = "app/locales"
export const BLOG_DIR = "content/blog"
export const GLOSSARY_DIR = "content/glossary"
export const GUIDES_DIR = "content/guides"
export const SERIES_DIR = "content/series"

/** Fails the build when a post's `<Term>` has no glossary entry in its locale. */
export function checkTerms(posts: readonly Post[], terms: readonly Term[]) {
  const known = new Set(terms.map((term) => `${term.lang}/${term.id}`))
  for (const post of posts)
    for (const id of post.terms)
      if (!known.has(`${post.lang}/${id}`))
        throw new Error(
          `${BLOG_DIR}/${post.slug}/${post.lang}.mdx: <Term id="${id}"> has no ${GLOSSARY_DIR}/${id}/${post.lang}.mdx`
        )
}

/** Build-time only: the locales each page ships in, the posts and entries that ship, and the blog's routes. */
export function readiness(
  root: string,
  previews = false
): {
  pages: Map<PageId, Locale[]>
  posts: Post[]
  terms: Term[]
  routes: BlogRoute[]
} {
  const catalogs = withoutReplaced(
    computeReadiness({
      localesDir: join(root, LOCALES_DIR),
      pages: Object.fromEntries(
        Object.keys(PAGES).map((id) => [id, pageNamespaces(id as PageId)])
      ),
    }) as Map<PageId, Locale[]>
  )
  const posts = publishedPosts(
    readPosts(join(root, BLOG_DIR), previews),
    catalogs.get("blog") ?? []
  )
  const pages = withBlogIndex(catalogs, posts)
  const blog = new Set(pages.get("blog"))
  const terms = readTerms(join(root, GLOSSARY_DIR)).filter((term) =>
    blog.has(term.lang)
  )
  checkTerms(posts, terms)
  return { pages, posts, terms, routes: blogRoutes(posts, terms) }
}

/**
 * Topic URLs with no page and no English page to fall back to, each sent to the nearest blog index.
 * Temporary, because a new post in the topic brings the page back.
 */
export function emptyTopicRedirects(
  posts: readonly Post[]
): [string, string][] {
  const blogLangs = new Set(posts.map((post) => post.lang))
  if (!blogLangs.has("en")) return []
  const shipped = new Set(
    blogRoutes(posts, [])
      .filter((route) => route.kind === "topic")
      .map((route) => `/${route.lang}${route.path}`)
  )
  return LOCALES.flatMap((lang) =>
    TOPICS.filter(
      (topic) =>
        !shipped.has(`/${lang}${topicPath(topic)}`) &&
        !shipped.has(`/en${topicPath(topic)}`)
    ).map((topic): [string, string] => [
      `/${lang}${topicPath(topic)}`,
      `/${blogLangs.has(lang) ? lang : "en"}${PAGES.blog.path}`,
    ])
  )
}

/** Every `/<lang><path>` whose catalogs are complete, and every blog page. */
export function readyPaths(root: string, previews = false): string[] {
  const { pages, routes } = readiness(root, previews)
  return [
    ...[...pages].flatMap(([id, locales]) =>
      locales.map((lang) => `/${lang}${PAGES[id].path}`)
    ),
    ...routes.map((route) => `/${route.lang}${route.path}`),
    ...(pages.get("blog") ?? []).flatMap((lang) => [
      `/${lang}${searchIndexPath}`,
      `/${lang}${feedPath}`,
    ]),
  ]
}
