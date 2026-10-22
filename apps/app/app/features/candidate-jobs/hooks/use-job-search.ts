import { useState } from "react"
import { useSearchParams } from "react-router"

import {
  EMPTY_SEARCH,
  loadSaved,
  readSearch,
  searchKey,
  storeSaved,
  writeSearch,
} from "../lib/search"
import type { JobSearch } from "../types"

const KEEP = ["job"]

/** The search lives in the URL; any change but paging starts again at page 1. */
export function useJobSearch() {
  const [params, setParams] = useSearchParams()
  const search = readSearch(params)

  const replace = (next: URLSearchParams, prev: URLSearchParams) => {
    for (const name of KEEP) {
      const value = prev.get(name)
      if (value) next.set(name, value)
    }
    return next
  }

  const update = (change: Partial<JobSearch>) => {
    setParams(
      (prev) =>
        replace(writeSearch({ ...readSearch(prev), page: 1, ...change }), prev),
      { preventScrollReset: true }
    )
  }

  return {
    search,
    key: searchKey(search),
    update,
    clear: () => {
      update({ ...EMPTY_SEARCH, q: search.q, location: search.location })
    },
    clearAll: () => {
      update({ ...EMPTY_SEARCH, sort: search.sort })
    },
    restore: (key: string) => {
      setParams((prev) => replace(new URLSearchParams(key), prev), {
        preventScrollReset: true,
      })
    },
  }
}

export function useSavedSearches(key: string) {
  const [saved, setSaved] = useState(loadSaved)

  const write = (next: string[]) => {
    setSaved(next)
    storeSaved(next)
  }

  return {
    saved,
    isSaved: saved.includes(key),
    toggle: () => {
      write(
        saved.includes(key)
          ? saved.filter((item) => item !== key)
          : [key, ...saved]
      )
    },
    remove: (item: string) => {
      write(saved.filter((other) => other !== item))
    },
  }
}
