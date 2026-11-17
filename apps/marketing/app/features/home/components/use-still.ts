import { useSyncExternalStore } from "react"

import { useHydrated } from "@/hooks/use-hydrated"

// keep in step with the `pin` variant in app.css
const UNPINNED = "(width < 64rem) or (height < 42rem)"
const REDUCED = "(prefers-reduced-motion: reduce)"

const subscribe = (onChange: () => void) => {
  const queries = [UNPINNED, REDUCED].map((query) => window.matchMedia(query))
  for (const query of queries) query.addEventListener("change", onChange)
  return () => {
    for (const query of queries) query.removeEventListener("change", onChange)
  }
}

const matches = (query: string) => () => window.matchMedia(query).matches
const never = () => false

/**
 * Whether scroll-driven motion should hold still: reduced motion, or a screen too small to
 * pin a scene when `onlyWhenPinned`. False until hydration, so the markup matches the
 * prerender. Both are read live, since either can change while the page is open.
 */
export function useStill(onlyWhenPinned: boolean) {
  const reduced = useSyncExternalStore(subscribe, matches(REDUCED), never)
  const unpinned = useSyncExternalStore(subscribe, matches(UNPINNED), never)
  return useHydrated() && (reduced || (onlyWhenPinned && unpinned))
}
