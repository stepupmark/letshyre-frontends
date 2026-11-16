import { type Locale, localePath } from "@workspace/i18n"
import { z } from "zod"

import { TAGS, TOPICS } from "@/lib/blog/list"
import { searchIndexPath } from "@/lib/blog/paths"
import type { PostSummary } from "@/lib/blog/post"

const indexSchema = z.array(
  z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    topic: z.enum(TOPICS),
    tags: z.array(z.enum(TAGS)),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    minutes: z.number(),
    draft: z.boolean(),
    cover: z.object({ src: z.string() }).optional(),
    preview: z.literal(true).optional(),
  })
) satisfies z.ZodType<PostSummary[]>

const loads = new Map<Locale, Promise<PostSummary[] | undefined>>()

// the build's own id, so a deploy never serves the previous build's index from a cache
const VERSION = typeof __BLOG_BUILD_ID__ === "string" ? __BLOG_BUILD_ID__ : ""

/**
 * Every post in the locale, fetched once. A failure resolves to undefined and stays cached until
 * `retrySearchIndex`, so typing while offline doesn't refetch on every key.
 */
export function loadSearchIndex(lang: Locale) {
  let load = loads.get(lang)
  if (!load) {
    const url = localePath(lang, searchIndexPath)
    load = fetch(VERSION ? `${url}?v=${VERSION}` : url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return indexSchema.parse(await response.json())
      })
      .catch(() => undefined)
    loads.set(lang, load)
  }
  return load
}

export function retrySearchIndex(lang: Locale) {
  loads.delete(lang)
}
