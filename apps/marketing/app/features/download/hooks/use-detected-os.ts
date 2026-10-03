import { useSyncExternalStore } from "react"

import { type DetectedOs, detectOs, type NavigatorLike } from "../lib/detect-os"

const subscribe = () => () => undefined

/** `null` while prerendering and hydrating, so the HTML never depends on the visitor. */
export function useDetectedOs(): DetectedOs | null {
  return useSyncExternalStore(
    subscribe,
    () => detectOs(navigator as NavigatorLike),
    () => null
  )
}
