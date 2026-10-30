import { useRef } from "react"
import { useSearchParams } from "react-router"

import { NO_FILTERS, readParams, writeParams } from "../lib/params"
import type { SearchChange } from "../types"

export function useSearchState() {
  const [url, setUrl] = useSearchParams()
  // react-router's updater sees the committed URL, so a second quick change would drop the first
  const inFlight = useRef<{ from: string; to: URLSearchParams } | null>(null)

  const update = (change: SearchChange) => {
    const from = url.toString()
    const base = inFlight.current?.from === from ? inFlight.current.to : url
    const to = writeParams(base, change)
    inFlight.current = { from, to }
    setUrl(to, { replace: !("page" in change), preventScrollReset: true })
  }

  return {
    params: readParams(url),
    update,
    clearFilters: () => {
      update(NO_FILTERS)
    },
  }
}
