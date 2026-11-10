import type { MDXContent } from "mdx/types"
import { use } from "react"

import { type BodyKind, loadBody, loadedBody } from "../lib/post-modules"

/**
 * A post's, term's or guide's MDX component. The loader has it ready at build time. On the client,
 * hydration waits for its chunk with the prerendered HTML on screen; there is deliberately no
 * Suspense boundary, since React streams a large one out of place behind an inline script.
 */
export function useMdxBody(
  kind: BodyKind,
  lang: string,
  id: string
): MDXContent {
  const ready = loadedBody(kind, lang, id)
  if (ready) return ready
  use(loadBody(kind, lang, id))
  const body = loadedBody(kind, lang, id)
  if (!body) throw new Error(`${kind}/${id}/${lang} didn't load`)
  return body
}

export const usePostBody = (lang: string, slug: string) =>
  useMdxBody("blog", lang, slug)
