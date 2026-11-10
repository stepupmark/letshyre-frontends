import { useSyncExternalStore } from "react"

const CHANGE = "blog-search"

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE, onChange)
  window.addEventListener("popstate", onChange)
  return () => {
    window.removeEventListener(CHANGE, onChange)
    window.removeEventListener("popstate", onChange)
  }
}

const read = () => new URLSearchParams(window.location.search).get("q") ?? ""

/**
 * The index search lives in `?q=` so it can be shared. It's written with replaceState: a router
 * navigation would refetch the page's data for nothing.
 */
export function useSearchQuery() {
  const query = useSyncExternalStore(subscribe, read, () => "")

  const change = (next: string) => {
    const url = new URL(window.location.href)
    if (next.trim()) url.searchParams.set("q", next)
    else url.searchParams.delete("q")
    window.history.replaceState(window.history.state, "", url)
    window.dispatchEvent(new Event(CHANGE))
  }

  return [query, change] as const
}
