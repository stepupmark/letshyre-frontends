import { useSyncExternalStore } from "react"
import type { z } from "zod"

// what a reader keeps on this blog lives in their own browser only; nothing is sent anywhere
const PREFIX = "lh-blog:"
const CHANGE = "lh-blog-store"

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(CHANGE, onChange)
    window.removeEventListener("storage", onChange)
  }
}

type Area = "local" | "session"

const storage = (area: Area) =>
  area === "session" ? window.sessionStorage : window.localStorage

function readRaw(area: Area, key: string): string | null {
  try {
    return storage(area).getItem(PREFIX + key)
  } catch {
    return null
  }
}

/**
 * A JSON value in web storage, checked on read; private mode or a full disk just forgets it.
 * `session` keeps it for the tab only.
 */
export function localStore<T>(
  key: string,
  schema: z.ZodType<T>,
  fallback: T,
  area: Area = "local"
) {
  let cache: { raw: string | null; value: T } | undefined

  const read = (): T => {
    const raw = readRaw(area, key)
    if (cache?.raw !== raw) {
      let value = fallback
      try {
        const parsed = schema.safeParse(raw === null ? null : JSON.parse(raw))
        if (parsed.success) value = parsed.data
      } catch {
        // not JSON, so keep the fallback
      }
      cache = { raw, value }
    }
    return cache.value
  }

  const write = (value: T) => {
    try {
      storage(area).setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      return
    }
    window.dispatchEvent(new Event(CHANGE))
  }

  /** `undefined` while prerendering and hydrating, so the page matches its HTML first. */
  const useValue = () =>
    useSyncExternalStore<T | undefined>(subscribe, read, () => undefined)

  return { read, write, useValue }
}
