import { useEffect, useState } from "react"

/**
 * The index search, kept in `?q=` so a search can be shared. The prerendered page has no query,
 * so it's read after hydration, and written with replaceState: a router navigation would refetch
 * the page's data for nothing.
 */
export function useSearchQuery() {
  const [query, setQuery] = useState("")

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q")
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL is only readable after hydration
    if (initial) setQuery(initial)
  }, [])

  const change = (next: string) => {
    setQuery(next)
    const url = new URL(window.location.href)
    if (next.trim()) url.searchParams.set("q", next)
    else url.searchParams.delete("q")
    window.history.replaceState(window.history.state, "", url)
  }

  return [query, change] as const
}
