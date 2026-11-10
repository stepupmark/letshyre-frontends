import { z } from "zod"

import type { Post } from "@/lib/blog/post"

import { localStore } from "./local-store"

const slugs = z.array(z.string()).max(200)
const savedStores = new Map<string, ReturnType<typeof makeSaved>>()
const makeSaved = (lang: string) => localStore(`saved:${lang}`, slugs, [])

/** The posts a reader saved in this locale, newest save first. */
export function savedPosts(lang: string) {
  let store = savedStores.get(lang)
  if (!store) {
    store = makeSaved(lang)
    savedStores.set(lang, store)
  }
  const toggle = (slug: string): boolean => {
    const saved = store.read()
    const on = !saved.includes(slug)
    store.write(on ? [slug, ...saved] : saved.filter((s) => s !== slug))
    return on
  }
  return { ...store, toggle }
}

// slug to how far down the post the reader got, 0 to 1; oldest dropped past this many
const KEEP = 50
export const readingPositions = localStore(
  "positions",
  z.record(z.string(), z.number().min(0).max(1)),
  {}
)

export function rememberPosition(key: string, at: number) {
  const { [key]: _, ...rest } = readingPositions.read()
  const kept = Object.entries(rest).slice(-(KEEP - 1))
  readingPositions.write({ ...Object.fromEntries(kept), [key]: at })
}

/** Who the reader seems to be: set by the posts they read and the call to action they pick. */
export const readerAudience = localStore(
  "audience",
  z.enum(["employers", "candidates"]).nullable(),
  null
)

export const rememberAudience = (audience: Post["audience"]) => {
  if (audience !== "everyone") readerAudience.write(audience)
}
