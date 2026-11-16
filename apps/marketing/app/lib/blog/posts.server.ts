import type { Locale } from "@workspace/i18n"

import { env } from "../env"
import { catalogReadiness } from "../messages.server"
import { blogBuild } from "./build"
import { previewsOn } from "./list"
import { blogModel } from "./model"
import type { Post } from "./post"

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

const covers = import.meta.glob<string>("/content/blog/*/cover.svg", {
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
  return src ? { ...post, cover: { src } } : post
}

// react-router.config.ts fixed the build's date and previews, so these match the prerender list
const build = blogBuild()
const model = blogModel(
  {
    posts: Object.entries(sources),
    terms: Object.entries(termSources),
    guides: Object.entries(guideSources),
    series: Object.entries(seriesSources),
  },
  {
    previews:
      process.env.BLOG_PREVIEWS === undefined
        ? previewsOn(env.VITE_ENV, import.meta.env.DEV)
        : build.previews,
    blogLocales: catalogReadiness.get("blog") ?? [],
    date: build.date,
  }
)

/** Newest first: the posts that ship, each in a locale whose blog copy is complete. */
export const posts: Post[] = model.posts.map(withCover)
const { terms, guides, series } = model

const routeLocales = new Map(
  model.routes.map((route) => [route.path, route.locales])
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
