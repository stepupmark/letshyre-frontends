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
    featured: z.boolean().default(false),
  })
  .refine((post) => !post.updatedAt || post.updatedAt >= post.publishedAt, {
    message: "updatedAt is before publishedAt",
    path: ["updatedAt"],
  })

export interface Heading {
  id: string
  text: string
}

/** A study cited by a `<Stat>` has a title; a link in the text has the words that link it. */
export interface Source {
  url: string
  title?: string
  linkText?: string
}

export type Post = z.output<typeof frontmatterSchema> & {
  slug: string
  lang: Locale
  minutes: number
  headings: Heading[]
  /** Every external link and study, in reading order, numbered by its place here. */
  sources: Source[]
  /** Has a `<Feature>`, so it skips the mid-post call to action. */
  promoted: boolean
  /** `<slug>/cover.svg`, and `cover-dark.svg` if drawn. */
  cover?: { src: string; srcDark?: string }
  /** Set on staging builds for a draft or a post that isn't due yet. */
  preview?: true
}

const FILE = /([^/\\]+)[/\\]([^/\\]+)\.mdx$/
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
// Segments under /blogs that belong to the blog's own pages, now or later.
const RESERVED_SLUGS = ["topics", "page", "authors", "feed"]
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

const LINK = /\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g
const STAT = /<Stat\b[^>]*>/g
const ATTR = {
  source: /\bsource="([^"]*)"/,
  cite: /\bcite="([^"]*)"/,
}
const attr = (tag: string, name: keyof typeof ATTR) => ATTR[name].exec(tag)?.[1]

const tidy = (text: string) => text.replace(/\s+/g, " ")

function sourcesOf(body: string): Source[] {
  const found: (Source & { at: number })[] = []
  for (const m of body.matchAll(LINK))
    found.push({ url: m[2] ?? "", linkText: tidy(m[1] ?? ""), at: m.index })
  for (const m of body.matchAll(STAT)) {
    const url = attr(m[0], "source")
    if (url) found.push({ url, title: attr(m[0], "cite"), at: m.index })
  }
  const seen = new Set<string>()
  return found
    .sort((x, y) => x.at - y.at)
    .filter(({ url }) => !seen.has(url) && seen.add(url))
    .map(({ at: _at, ...source }) => source)
}

/** Reads `<slug>/<lang>.mdx`; throws with the file name so a bad post fails the build. */
export function parsePost(file: string, source: string): Post {
  const [, slug = "", lang = ""] = FILE.exec(file) ?? []
  const fail = (reason: string): never => {
    throw new Error(`${file}: ${reason}`)
  }
  if (!SLUG.test(slug)) fail(`"${slug}" isn't a lowercase-hyphenated slug`)
  if (RESERVED_SLUGS.includes(slug)) fail(`"${slug}" is a reserved slug`)
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
    sources: sourcesOf(body),
    promoted: /<Feature\b/.test(body),
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

export const topicCounts = (posts: readonly Post[]) =>
  topicsOf(posts).map((topic) => ({
    topic,
    count: posts.filter((post) => post.topic === topic).length,
  }))

/** Newest first, with the newest featured post moved to the top of the index. */
export function featuredFirst<T extends Pick<Post, "featured">>(
  posts: readonly T[]
): T[] {
  const lead = posts.find((post) => post.featured)
  return lead ? [lead, ...posts.filter((post) => post !== lead)] : [...posts]
}

// Page one is a lead post over a grid of nine; later pages are the grid alone.
const FIRST_PAGE = 10
const PAGE_SIZE = 9

export const pageCount = (total: number) =>
  total <= FIRST_PAGE ? 1 : 1 + Math.ceil((total - FIRST_PAGE) / PAGE_SIZE)

export function postsOnPage<T>(posts: readonly T[], page: number): T[] {
  if (page === 1) return posts.slice(0, FIRST_PAGE)
  const start = FIRST_PAGE + (page - 2) * PAGE_SIZE
  return posts.slice(start, start + PAGE_SIZE)
}
