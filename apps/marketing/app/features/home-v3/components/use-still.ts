import { useSyncExternalStore } from "react"

import { useHydrated } from "@/hooks/use-hydrated"

const NARROW = "(width < 64rem)"
const REDUCED = "(prefers-reduced-motion: reduce)"

const subscribe = (onChange: () => void) => {
  const queries = [NARROW, REDUCED].map((query) => window.matchMedia(query))
  for (const query of queries) query.addEventListener("change", onChange)
  return () => {
    for (const query of queries) query.removeEventListener("change", onChange)
  }
}

const matches = (query: string) => () => window.matchMedia(query).matches
const never = () => false

/**
 * Whether scroll-driven motion should hold still: reduced motion, or below `lg` when
 * the scene only plays from there. False until hydration, so the markup matches the
 * prerender. Both are read live, since either can change while the page is open.
 */
export function useStill(onlyFromLg: boolean) {
  const reduced = useSyncExternalStore(subscribe, matches(REDUCED), never)
  const narrow = useSyncExternalStore(subscribe, matches(NARROW), never)
  return useHydrated() && (reduced || (onlyFromLg && narrow))
}
