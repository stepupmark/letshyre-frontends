import { type Catalog, type Locale, type Messages } from "@workspace/i18n"
import { type Catalogs, readinessFrom } from "@workspace/i18n/node"

import { allGuides, allPosts, allTerms } from "./blog/posts.server"
import { pageCount, publishedPosts, type Tag, withBlogIndex } from "./blog/list"
import type { Post } from "./blog/post"
import { PAGES, type PageId, pageNamespaces, withoutReplaced } from "./pages"

const files = import.meta.glob<Catalog>("../locales/*/*.json", {
  eager: true,
  import: "default",
})

const catalogs: Catalogs = new Map()
for (const [path, catalog] of Object.entries(files)) {
  const [, lang = "", ns = ""] = /([^/]+)\/([^/]+)\.json$/.exec(path) ?? []
  const byNs = catalogs.get(lang as Locale) ?? new Map<string, Catalog>()
  byNs.set(ns, catalog)
  catalogs.set(lang as Locale, byNs)
}

const catalogReadiness = withoutReplaced(
  readinessFrom(
    catalogs,
    Object.fromEntries(
      Object.keys(PAGES).map((id) => [id, pageNamespaces(id as PageId)])
    )
  ) as Map<PageId, Locale[]>
)

export function loadMessages(
  lang: Locale,
  namespaces: readonly string[]
): Messages {
  const byNs = catalogs.get(lang)
  return {
    [lang]: Object.fromEntries(
      namespaces.flatMap((ns) => {
        const catalog = byNs?.get(ns)
        return catalog ? [[ns, catalog]] : []
      })
    ),
  }
}

const posts = publishedPosts(allPosts, catalogReadiness.get("blog") ?? [])
const readiness = withBlogIndex(catalogReadiness, posts)
const terms = allTerms.filter((term) =>
  readiness.get("blog")?.includes(term.lang)
)

/** Locales the page is published in, for hreflang and the language switcher. */
export const readyLocales = (id: PageId): Locale[] => readiness.get(id) ?? []

/** Newest first. */
export const postsIn = (lang: Locale): Post[] =>
  posts.filter((post) => post.lang === lang)

export const postLocales = (slug: string): Locale[] =>
  posts.filter((post) => post.slug === slug).map((post) => post.lang)

export const topicLocales = (topic: string): Locale[] => [
  ...new Set(
    posts.filter((post) => post.topic === topic).map((post) => post.lang)
  ),
]

export const indexPageLocales = (page: number): Locale[] =>
  readyLocales("blog").filter((lang) => pageCount(postsIn(lang).length) >= page)

export const tagLocales = (tag: Tag): Locale[] => [
  ...new Set(
    posts.filter((post) => post.tags.includes(tag)).map((post) => post.lang)
  ),
]

/** A–Z in the locale's own order. */
export const termsIn = (lang: Locale) =>
  terms
    .filter((term) => term.lang === lang)
    .sort((a, b) => a.term.localeCompare(b.term, lang))

export const termLocales = (id: string): Locale[] =>
  terms.filter((term) => term.id === id).map((term) => term.lang)

export const glossaryLocales = (): Locale[] => [
  ...new Set(terms.map((term) => term.lang)),
]

export const guideFor = (lang: Locale, topic: string) =>
  allGuides.find((guide) => guide.lang === lang && guide.topic === topic)
