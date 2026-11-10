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

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key)
  } catch {
    return null
  }
}

/** A JSON value in localStorage, checked on read; private mode or a full disk just forgets it. */
export function localStore<T>(key: string, schema: z.ZodType<T>, fallback: T) {
  let cache: { raw: string | null; value: T } | undefined

  const read = (): T => {
    const raw = readRaw(key)
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
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
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
