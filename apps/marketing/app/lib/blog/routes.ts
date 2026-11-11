// Node loads this through react-router.config.ts, so no Vite-only imports.

import type { Locale } from "@workspace/i18n"

import type { Term } from "./glossary.ts"
import { pageCount, tagsOf, topicsOf } from "./list.ts"
import {
  glossaryPath,
  indexPagePath,
  postPath,
  tagPath,
  termPath,
  topicPath,
} from "./paths.ts"
import type { Post } from "./post.ts"

export interface BlogRoute {
  kind: "post" | "topic" | "tag" | "page" | "glossary" | "term"
  lang: Locale
  /** Relative to the locale. */
  path: string
  /** Every locale this path ships in, for hreflang and the sitemap. */
  locales: Locale[]
  /** The newest post date it shows, when it's a list of posts. */
  updated?: string
  /** The glossary entry, for a term page. */
  term?: string
}

const newest = (posts: readonly Post[]) =>
  posts
    .map((post) => post.updatedAt ?? post.publishedAt)
    .sort()
    .at(-1)

/**
 * Every blog page beyond the index, from the posts and glossary entries that ship. Prerendering,
 * the sitemap, the build checks and the loaders' hreflang all read this one list.
 */
export function blogRoutes(
  posts: readonly Post[],
  terms: readonly Term[]
): BlogRoute[] {
  const langs = [...new Set(posts.map((post) => post.lang))]
  const routes: Omit<BlogRoute, "locales">[] = langs.flatMap((lang) => {
    const own = posts.filter((post) => post.lang === lang)
    const glossary = terms.filter((term) => term.lang === lang)
    return [
      ...own.map((post) => ({
        kind: "post" as const,
        lang,
        path: postPath(post.slug),
        updated: post.updatedAt ?? post.publishedAt,
      })),
      ...topicsOf(own).map((topic) => ({
        kind: "topic" as const,
        lang,
        path: topicPath(topic),
        updated: newest(own.filter((post) => post.topic === topic)),
      })),
      ...tagsOf(own).map((tag) => ({
        kind: "tag" as const,
        lang,
        path: tagPath(tag),
        updated: newest(own.filter((post) => post.tags.includes(tag))),
      })),
      ...Array.from({ length: pageCount(own.length) - 1 }, (_, i) => ({
        kind: "page" as const,
        lang,
        path: indexPagePath(i + 2),
      })),
      ...(glossary.length
        ? [{ kind: "glossary" as const, lang, path: glossaryPath }]
        : []),
      ...glossary.map((term) => ({
        kind: "term" as const,
        lang,
        path: termPath(term.id),
        term: term.id,
      })),
    ]
  })

  const localesOf = new Map<string, Locale[]>()
  for (const { path, lang } of routes)
    localesOf.set(path, [...(localesOf.get(path) ?? []), lang])
  return routes.map((route) => ({
    ...route,
    locales: localesOf.get(route.path) ?? [],
  }))
}
