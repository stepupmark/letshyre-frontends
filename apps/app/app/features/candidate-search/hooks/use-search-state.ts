import { useRef } from "react"
import { useSearchParams } from "react-router"

import { NO_FILTERS, readParams, writeParams } from "../lib/params"
import type { SearchChange } from "../types"

const SELECTED = "candidate"

export function useSearchState() {
  const [url, setUrl] = useSearchParams()
  // react-router's updater sees the committed URL, so a second quick change would drop the first
  const inFlight = useRef<{ from: string; to: URLSearchParams } | null>(null)

  const commit = (edit: (base: URLSearchParams) => URLSearchParams) => {
    const from = url.toString()
    const base = inFlight.current?.from === from ? inFlight.current.to : url
    const to = edit(base)
    inFlight.current = { from, to }
    return to
  }

  const update = (change: SearchChange) => {
    const to = commit((base) => {
      const next = writeParams(base, change)
      next.delete(SELECTED)
      return next
    })
    setUrl(to, { replace: !("page" in change), preventScrollReset: true })
  }

  const select = (key: string | null) => {
    const to = commit((base) => {
      const next = new URLSearchParams(base)
      if (key) next.set(SELECTED, key)
      else next.delete(SELECTED)
      return next
    })
    setUrl(to, { replace: true, preventScrollReset: true })
  }

  return {
    params: readParams(url),
    selected: url.get(SELECTED),
    update,
    select,
    clearFilters: () => {
      update(NO_FILTERS)
    },
  }
}
