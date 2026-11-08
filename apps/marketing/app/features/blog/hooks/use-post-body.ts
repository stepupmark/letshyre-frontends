import type { MDXContent } from "mdx/types"
import { use } from "react"

import { loadedPostBody, loadPostBody } from "../lib/post-modules"

/**
 * The post's MDX component. The loader has it ready at build time. On the client, hydration waits
 * for the post's chunk with the prerendered HTML on screen; there is deliberately no Suspense
 * boundary, since React streams a large one out of place behind an inline script.
 */
export function usePostBody(lang: string, slug: string): MDXContent {
  const ready = loadedPostBody(lang, slug)
  if (ready) return ready
  use(loadPostBody(lang, slug))
  const body = loadedPostBody(lang, slug)
  if (!body) throw new Error(`Post ${lang}/${slug} didn't load`)
  return body
}
