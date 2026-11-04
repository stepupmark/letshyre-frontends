import { useReducedMotion } from "motion/react"
import { useSyncExternalStore } from "react"

import { useHydrated } from "@/hooks/use-hydrated"

const NARROW = "(width < 48rem)"

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(NARROW)
  query.addEventListener("change", onChange)
  return () => {
    query.removeEventListener("change", onChange)
  }
}

/**
 * Whether scroll-driven motion should hold still: reduced motion, or a phone when the
 * scene only plays from `md`. False until hydration, so the markup matches the prerender.
 */
export function useStill(onlyFromMd: boolean) {
  const reduced = useReducedMotion() ?? false
  const narrow = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(NARROW).matches,
    () => false
  )
  return useHydrated() && (reduced || (onlyFromMd && narrow))
}
