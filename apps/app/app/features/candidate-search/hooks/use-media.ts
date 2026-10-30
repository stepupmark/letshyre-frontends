import { useSyncExternalStore } from "react"

export function useMedia(query: string) {
  return useSyncExternalStore(
    (change) => {
      const list = matchMedia(query)
      list.addEventListener("change", change)
      return () => {
        list.removeEventListener("change", change)
      }
    },
    () => matchMedia(query).matches
  )
}
