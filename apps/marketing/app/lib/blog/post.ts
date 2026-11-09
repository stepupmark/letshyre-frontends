// Node loads this through react-router.config.ts, so no Vite-only imports.

import { isLocale, type Locale } from "@workspace/i18n"
import GithubSlugger from "github-slugger"
import { parse as parseYaml } from "yaml"
import { z } from "zod"

import type { PageId } from "../pages.ts"
import { AUTHORS } from "./authors.ts"

const AUDIENCES = ["employers", "candidates", "everyone"] as const
export const TOPICS = [
  "interviewing",
  "hiring",
  "careers",
  "trends",
  "news",
] as const
export type Topic = (typeof TOPICS)[number]

const frontmatterSchema = z
  .strictObject({
    title: z.string().min(1),
    metaTitle: z.string().min(1).optional(),
    description: z.string().min(1),
    publishedAt: z.iso.date(),
    updatedAt: z.iso.date().optional(),
    audience: z.enum(AUDIENCES),
    topic: z.enum(TOPICS),
    author: z
      .string()
      .refine((id) => id in AUTHORS, "isn't in app/lib/blog/authors.ts")
      .optional(),
    draft: z.boolean().default(false),
  })
  .refine((post) => !post.updatedAt || post.updatedAt >= post.publishedAt, {
    message: "updatedAt is before publishedAt",
    path: ["updatedAt"],
  })

export interface Heading {
  id: string
  text: string
}

export type Post = z.output<typeof frontmatterSchema> & {
  slug: string
  lang: Locale
  minutes: number
  headings: Heading[]
  /** `<slug>/cover.svg`, and `cover-dark.svg` if drawn. */
  cover?: { src: string; srcDark?: string }
  /** Set on staging builds for a draft or a post that isn't due yet. */
  preview?: true
}

const FILE = /([^/\\]+)[/\\]([^/\\]+)\.mdx$/
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/
const HEADING = /^(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/
const FENCE = /^\s*(```|~~~)/

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

/** The h2s, with the ids rehype-slug gives them; every level is slugged so duplicates count alike. */
function headingsOf(body: string): Heading[] {
  const slugger = new GithubSlugger()
  const headings: Heading[] = []
  let inFence = false
  for (const line of body.split(/\r?\n/)) {
    if (FENCE.test(line)) inFence = !inFence
    const match = inFence ? null : HEADING.exec(line)
    if (!match) continue
    const text = (match[2] ?? "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/(\*\*|__|\*|_|`)(.+?)\1/g, "$2")
    const id = slugger.slug(text)
    if (match[1] === "##") headings.push({ id, text })
  }
  return headings
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

  const body = source.slice(match[0].length)
  return {
    ...result.data,
    slug,
    lang: lang as Locale,
    minutes: readingMinutes(body, lang as Locale),
    headings: headingsOf(body),
  }
}

const today = () => new Date().toISOString().slice(0, 10)

/** Built and indexed: not a draft, and its UTC publish date has come. */
export const isLive = (post: Post, date = today()) =>
  !post.draft && post.publishedAt <= date

/** Production ships live posts only; staging and dev also show the rest, marked as previews. */
export const visiblePosts = (posts: readonly Post[], previews: boolean) =>
  posts.flatMap((post): Post[] => {
    if (isLive(post)) return [post]
    return previews ? [{ ...post, preview: true }] : []
  })

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

/** The topics these posts cover, in the order the index lists them. */
export const topicsOf = (posts: readonly Post[]): Topic[] =>
  TOPICS.filter((topic) => posts.some((post) => post.topic === topic))
