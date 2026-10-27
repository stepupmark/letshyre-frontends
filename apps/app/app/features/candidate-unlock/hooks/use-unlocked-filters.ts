import { readTableParams } from "@workspace/api/table-params"
import { useSearchParams } from "react-router"

import { NO_FILTERS, readFilters, writeFilters } from "../lib/filters"
import type { UnlockedFilters } from "../types"

export function useUnlockedFilters() {
  const [search, setSearch] = useSearchParams()
  const filters = readFilters(search)
  const table = readTableParams(search, { sortable: [] })

  const update = (change: Partial<UnlockedFilters>) => {
    setSearch(
      (prev) => writeFilters(prev, { ...readFilters(prev), ...change }),
      {
        preventScrollReset: true,
      }
    )
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
