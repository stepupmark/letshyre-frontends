import type { Locale } from "@workspace/i18n"

import { env } from "../env"
import { catalogReadiness } from "../messages.server"
import { parseGuide, parseSeries, parseTerm } from "./glossary"
import { previewsOn, publishedPosts } from "./list"
import { parsePosts, type Post } from "./post"
import { blogRoutes } from "./routes"

const sources = import.meta.glob<string>("/content/blog/*/*.mdx", {
  eager: true,
  query: "?raw",
  import: "default",
})

const ogImages = import.meta.glob<string>("/content/blog/*/og.jpg", {
  eager: true,
  query: "?url",
  import: "default",
})

const covers = import.meta.glob<string>("/content/blog/*/cover*.svg", {
  eager: true,
  query: "?url",
  import: "default",
})

const termSources = import.meta.glob<string>("/content/glossary/*/*.mdx", {
  eager: true,
  query: "?raw",
  import: "default",
})

const guideSources = import.meta.glob<string>("/content/guides/*/*.mdx", {
  eager: true,
  query: "?raw",
  import: "default",
})

const seriesSources = import.meta.glob<string>("/content/series/*/*.mdx", {
  eager: true,
  query: "?raw",
  import: "default",
})

function withCover(post: Post): Post {
  const src = covers[`/content/blog/${post.slug}/cover.svg`]
  if (!src) return post
  const srcDark = covers[`/content/blog/${post.slug}/cover-dark.svg`]
  return { ...post, cover: srcDark ? { src, srcDark } : { src } }
}

/** Newest first: the posts that ship, each in a locale whose blog copy is complete. */
export const posts: Post[] = publishedPosts(
  parsePosts(
    Object.entries(sources),
    previewsOn(env.VITE_ENV, import.meta.env.DEV)
  ).map(withCover),
  catalogReadiness.get("blog") ?? []
)

const postLangs = new Set(posts.map((post) => post.lang))
const terms = Object.entries(termSources)
  .map(([file, source]) => parseTerm(file, source))
  .filter((term) => postLangs.has(term.lang))
const guides = Object.entries(guideSources).map(([file, source]) =>
  parseGuide(file, source)
)

const series = Object.entries(seriesSources).map(([file, source]) =>
  parseSeries(file, source)
)

const routeLocales = new Map(
  blogRoutes(posts, terms).map((route) => [route.path, route.locales])
)

/** The locales a blog path ships in, for hreflang. */
export const blogLocalesOf = (path: string): Locale[] =>
  routeLocales.get(path) ?? []

/** A post's own share image, `<slug>/og.jpg`, if it has one. */
export const ogImageOf = (slug: string): string | undefined =>
  ogImages[`/content/blog/${slug}/og.jpg`]

export const postsIn = (lang: Locale): Post[] =>
  posts.filter((post) => post.lang === lang)

/** A–Z in the locale's own order. */
export const termsIn = (lang: Locale) =>
  terms
    .filter((term) => term.lang === lang)
    .sort((a, b) => a.term.localeCompare(b.term, lang))

export const guideFor = (lang: Locale, topic: string) =>
  guides.find((guide) => guide.lang === lang && guide.topic === topic)

/** The series a post is part of in its locale, if any. */
export const seriesOf = (lang: Locale, slug: string) =>
  series.find((s) => s.lang === lang && s.posts.includes(slug))
