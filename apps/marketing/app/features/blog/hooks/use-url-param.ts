import { useSyncExternalStore } from "react"

const CHANGE = "blog-url-param"

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE, onChange)
  window.addEventListener("popstate", onChange)
  return () => {
    window.removeEventListener(CHANGE, onChange)
    window.removeEventListener("popstate", onChange)
  }
}

/**
 * The index's search and filters live in the query string so they can be shared. They're written
 * with replaceState: a router navigation would refetch the page's data for nothing.
 */
export function useUrlParam(name: string) {
  const value = useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(name) ?? "",
    () => ""
  )

  const change = (next: string) => {
    const url = new URL(window.location.href)
    if (next.trim()) url.searchParams.set(name, next)
    else url.searchParams.delete(name)
    window.history.replaceState(window.history.state, "", url)
    window.dispatchEvent(new Event(CHANGE))
  }

  return [value, change] as const
}
