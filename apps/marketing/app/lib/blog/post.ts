// Node loads this through react-router.config.ts, so no Vite-only imports.

import { isLocale, type Locale } from "@workspace/i18n"
import { parse as parseYaml } from "yaml"
import { z } from "zod"

import type { PageId } from "../pages.ts"

const frontmatterSchema = z
  .strictObject({
    title: z.string().min(1),
    metaTitle: z.string().min(1).optional(),
    description: z.string().min(1),
    publishedAt: z.iso.date(),
    updatedAt: z.iso.date().optional(),
    draft: z.boolean().default(false),
  })
  .refine((post) => !post.updatedAt || post.updatedAt >= post.publishedAt, {
    message: "updatedAt is before publishedAt",
    path: ["updatedAt"],
  })

export type Post = z.output<typeof frontmatterSchema> & {
  slug: string
  lang: Locale
  minutes: number
}

const FILE = /([^/\\]+)[/\\]([^/\\]+)\.mdx$/
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/

function readingMinutes(body: string, lang: Locale): number {
  const text = body
    .replace(/^import .*$/gm, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`>|[\]()-]/g, " ")
  let words = 0
  for (const segment of new Intl.Segmenter(lang, {
    granularity: "word",
  }).segment(text)) {
    if (segment.isWordLike) words++
  }
  return Math.max(1, Math.round(words / 200))
}

/** Reads `<slug>/<lang>.mdx`; throws with the file name so a bad post fails the build. */
export function parsePost(file: string, source: string): Post {
  const [, slug = "", lang = ""] = FILE.exec(file) ?? []
  const fail = (reason: string): never => {
    throw new Error(`${file}: ${reason}`)
  }
  if (!SLUG.test(slug)) fail(`"${slug}" isn't a lowercase-hyphenated slug`)
  if (!isLocale(lang)) fail(`"${lang}" isn't a locale`)

  const match = FRONTMATTER.exec(source)
  if (!match) return fail("no frontmatter")
  const result = frontmatterSchema.safeParse(parseYaml(match[1] ?? ""))
  if (!result.success) return fail(z.prettifyError(result.error))

  return {
    ...result.data,
    slug,
    lang: lang as Locale,
    minutes: readingMinutes(source.slice(match[0].length), lang as Locale),
  }
}

export const postPath = (slug: string) => `/blog/${slug}`

export const today = () => new Date().toISOString().slice(0, 10)

/** Built and indexed: not a draft, and its UTC publish date has come. */
export const isLive = (post: Post, date = today()) =>
  !post.draft && post.publishedAt <= date

/** Newest first. Posts need the blog's copy in their locale to ship. */
export const publishedPosts = (
  posts: readonly Post[],
  blogLocales: readonly Locale[]
): Post[] =>
  posts
    .filter((post) => blogLocales.includes(post.lang))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

/** The blog index ships only where at least one post does. */
export function withBlogIndex(
  ready: Map<PageId, Locale[]>,
  posts: readonly Post[]
): Map<PageId, Locale[]> {
  const langs = new Set(posts.map((post) => post.lang))
  return new Map(
    [...ready].map(([id, locales]) => [
      id,
      id === "blog" ? locales.filter((lang) => langs.has(lang)) : locales,
    ])
  )
}
