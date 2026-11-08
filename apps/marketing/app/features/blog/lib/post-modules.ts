import type { MDXContent } from "mdx/types"

const modules = import.meta.glob<{ default: MDXContent }>(
  "/content/blog/*/*.mdx"
)
const loaded = new Map<string, MDXContent>()
const pending = new Map<string, Promise<void>>()

const keyOf = (lang: string, slug: string) =>
  `/content/blog/${slug}/${lang}.mdx`

/** Each post is its own chunk; this fetches it once. */
export function loadPostBody(lang: string, slug: string): Promise<void> {
  const key = keyOf(lang, slug)
  const load = modules[key]
  if (!load) return Promise.reject(new Error(`No post at ${key}`))

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

export const loadedPostBody = (lang: string, slug: string) =>
  loaded.get(keyOf(lang, slug))
