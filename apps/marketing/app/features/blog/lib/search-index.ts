import { type Locale, localePath } from "@workspace/i18n"
import { z } from "zod"

import { TOPICS } from "@/lib/blog/list"
import { searchIndexPath } from "@/lib/blog/paths"
import type { PostSummary } from "@/lib/blog/post"

const indexSchema = z.array(
  z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    topic: z.enum(TOPICS),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    minutes: z.number(),
    draft: z.boolean(),
    cover: z
      .object({ src: z.string(), srcDark: z.string().optional() })
      .optional(),
    preview: z.literal(true).optional(),
  })
) satisfies z.ZodType<PostSummary[]>

const loads = new Map<Locale, Promise<PostSummary[] | undefined>>()

/** Every post in the locale, fetched once; undefined if it failed, so the caller can offer a retry. */
export function loadSearchIndex(lang: Locale) {
  let load = loads.get(lang)
  if (!load) {
    load = fetch(localePath(lang, searchIndexPath))
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return indexSchema.parse(await response.json())
      })
      .catch(() => {
        loads.delete(lang)
        return undefined
      })
    loads.set(lang, load)
  }
  return load
}
