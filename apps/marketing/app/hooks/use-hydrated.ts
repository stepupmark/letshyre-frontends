import { useSyncExternalStore } from "react"

const subscribe = () => () => undefined

/** False while prerendering and hydrating, true once the page runs in the browser. */
export const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
