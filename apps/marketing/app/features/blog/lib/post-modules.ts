import type { MDXContent } from "mdx/types"

const modules = import.meta.glob<{ default: MDXContent }>([
  "/content/blog/*/*.mdx",
  "/content/glossary/*/*.mdx",
  "/content/guides/*/*.mdx",
])
const loaded = new Map<string, MDXContent>()
const pending = new Map<string, Promise<void>>()

export type BodyKind = "blog" | "glossary" | "guides"

const keyOf = (kind: BodyKind, lang: string, id: string) =>
  `/content/${kind}/${id}/${lang}.mdx`

/** Each body is its own chunk; this fetches it once. */
export function loadBody(
  kind: BodyKind,
  lang: string,
  id: string
): Promise<void> {
  const key = keyOf(kind, lang, id)
  const load = modules[key]
  if (!load) return Promise.reject(new Error(`Nothing at ${key}`))

  let promise = pending.get(key)
  if (!promise) {
    promise = load().then(
      (module) => {
        loaded.set(key, module.default)
      },
      (error: unknown) => {
        pending.delete(key)
        throw error
      }
    )
    pending.set(key, promise)
  }
  return promise
}

export const loadPostBody = (lang: string, slug: string) =>
  loadBody("blog", lang, slug)

export const loadedBody = (kind: BodyKind, lang: string, id: string) =>
  loaded.get(keyOf(kind, lang, id))
