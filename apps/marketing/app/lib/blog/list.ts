import type { Locale } from "@workspace/i18n"

import type { PageId } from "../pages.ts"
import type { Post } from "./post.ts"

export const TOPICS = [
  "interviewing",
  "hiring",
  "careers",
  "trends",
  "news",
] as const
export type Topic = (typeof TOPICS)[number]

export const TAGS = [
  "ai",
  "resumes",
  "interviews",
  "salary",
  "india",
  "job-search",
  "hiring-process",
  "skills",
  "career-growth",
] as const
export type Tag = (typeof TAGS)[number]

export const LENGTHS = ["quick", "standard", "long"] as const
export type Length = (typeof LENGTHS)[number]

export const lengthOf = (minutes: number): Length =>
  minutes < 5 ? "quick" : minutes < 10 ? "standard" : "long"

const today = () => new Date().toISOString().slice(0, 10)

/** Built and indexed: not a draft, and its UTC publish date has come. */
export const isLive = (post: Post, date = today()) =>
  !post.draft && post.publishedAt <= date

/** Drafts and scheduled posts show on staging and in dev, never in production. */
export const previewsOn = (viteEnv: string | undefined, dev = false) =>
  dev || viteEnv === "staging"

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

// below this a tag's page only repeats its topic page
const MIN_TAG_POSTS = 3

/** The tags with enough of these posts for a page of their own, in the order of TAGS. */
export const tagsOf = (posts: readonly Pick<Post, "tags">[]): Tag[] =>
  TAGS.filter(
    (tag) =>
      posts.filter((post) => post.tags.includes(tag)).length >= MIN_TAG_POSTS
  )

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

/** Page numbers to show: the first, the last and the current with its neighbours; 0 marks a gap. */
export function pageWindow(page: number, pages: number): number[] {
  const shown = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b)
  return shown.flatMap((n, i) => {
    const prev = shown[i - 1]
    if (prev === undefined || n - prev === 1) return [n]
    return n - prev === 2 ? [n - 1, n] : [0, n]
  })
}
