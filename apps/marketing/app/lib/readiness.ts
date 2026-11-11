import { join } from "node:path"
import { LOCALES, type Locale } from "@workspace/i18n"
import { computeReadiness } from "@workspace/i18n/node"

import type { Term } from "./blog/glossary.ts"
import {
  glossaryPath,
  indexPagePath,
  postPath,
  searchIndexPath,
  tagPath,
  termPath,
  topicPath,
} from "./blog/paths.ts"
import {
  pageCount,
  publishedPosts,
  tagsOf,
  TOPICS,
  topicsOf,
  withBlogIndex,
} from "./blog/list.ts"
import type { Post } from "./blog/post.ts"
import { readPosts, readTerms } from "./blog/read-posts.ts"
import { PAGES, type PageId, pageNamespaces, withoutReplaced } from "./pages.ts"

const LOCALES_DIR = "app/locales"
export const BLOG_DIR = "content/blog"
export const GLOSSARY_DIR = "content/glossary"
export const GUIDES_DIR = "content/guides"

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

/** Build-time only: the locales each page ships in, and the posts that ship. `root` is the app's. */
export function readiness(
  root: string,
  previews = false
): {
  pages: Map<PageId, Locale[]>
  posts: Post[]
  terms: Term[]
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
  const ready = withBlogIndex(pages, posts)
  const blog = new Set(ready.get("blog"))
  const terms = readTerms(join(root, GLOSSARY_DIR)).filter((term) =>
    blog.has(term.lang)
  )
  checkTerms(posts, terms)
  return { pages: ready, posts, terms }
}

/** Each locale's tags that have a post. */
export const tagPages = (posts: readonly Post[]) =>
  [...new Set(posts.map((post) => post.lang))].flatMap((lang) =>
    tagsOf(posts.filter((post) => post.lang === lang)).map((tag) => ({
      lang,
      tag,
    }))
  )

/** Each locale's blog topics that have a post, as `/<lang>` and topic. */
export const topicPages = (posts: readonly Post[]) =>
  [...new Set(posts.map((post) => post.lang))].flatMap((lang) =>
    topicsOf(posts.filter((post) => post.lang === lang)).map((topic) => ({
      lang,
      topic,
    }))
  )

/** Each locale's blog index pages after the first, as `/<lang>` and page number. */
export const indexPages = (posts: readonly Post[]) =>
  [...new Set(posts.map((post) => post.lang))].flatMap((lang) =>
    Array.from(
      {
        length:
          pageCount(posts.filter((post) => post.lang === lang).length) - 1,
      },
      (_, i) => ({ lang, page: i + 2 })
    )
  )

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
    topicPages(posts).map(({ lang, topic }) => `/${lang}${topicPath(topic)}`)
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
  const { pages, posts, terms } = readiness(root, previews)
  const blogLangs = pages.get("blog") ?? []
  return [
    ...[...pages].flatMap(([id, locales]) =>
      locales.map((lang) => `/${lang}${PAGES[id].path}`)
    ),
    ...posts.map((post) => `/${post.lang}${postPath(post.slug)}`),
    ...topicPages(posts).map(
      ({ lang, topic }) => `/${lang}${topicPath(topic)}`
    ),
    ...indexPages(posts).map(
      ({ lang, page }) => `/${lang}${indexPagePath(page)}`
    ),
    ...tagPages(posts).map(({ lang, tag }) => `/${lang}${tagPath(tag)}`),
    ...blogLangs.map((lang) => `/${lang}${searchIndexPath}`),
    ...[...new Set(terms.map((term) => term.lang))].map(
      (lang) => `/${lang}${glossaryPath}`
    ),
    ...terms.map((term) => `/${term.lang}${termPath(term.id)}`),
  ]
}
