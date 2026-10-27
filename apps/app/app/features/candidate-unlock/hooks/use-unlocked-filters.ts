import { readTableParams } from "@workspace/api/table-params"
import { useRef } from "react"
import { useSearchParams } from "react-router"

import { NO_FILTERS, readFilters, writeFilters } from "../lib/filters"
import type { FilterChange } from "../types"

export function useUnlockedFilters() {
  const [search, setSearch] = useSearchParams()
  const filters = readFilters(search)
  const table = readTableParams(search, { sortable: [] })
  // react-router's updater sees the committed URL, so a second quick change would drop the first
  const inFlight = useRef<{ from: string; to: URLSearchParams } | null>(null)

  const update = (change: FilterChange) => {
    const from = search.toString()
    const base = inFlight.current?.from === from ? inFlight.current.to : search
    const current = readFilters(base)
    const next = typeof change === "function" ? change(current) : change
    const to = writeFilters(base, { ...current, ...next })
    inFlight.current = { from, to }
    setSearch(to, { preventScrollReset: true })
  }

  return {
    filters,
    table,
    setSearch,
    update,
    clear: () => {
      update(NO_FILTERS)
    },
  }
}
