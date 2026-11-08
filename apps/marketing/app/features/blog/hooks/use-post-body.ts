import type { MDXContent } from "mdx/types"
import { use } from "react"

import { loadedPostBody, loadPostBody } from "../lib/post-modules"

/**
 * The post's MDX component. The loader has it ready at build time; on the client the prerendered
 * HTML stays up until the post's chunk arrives.
 */
export function usePostBody(lang: string, slug: string): MDXContent {
  const ready = loadedPostBody(lang, slug)
  if (ready) return ready
  use(loadPostBody(lang, slug))
  const body = loadedPostBody(lang, slug)
  if (!body) throw new Error(`Post ${lang}/${slug} didn't load`)
  return body
}
