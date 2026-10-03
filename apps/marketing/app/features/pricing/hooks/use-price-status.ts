import type { UseQueryResult } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { priceStatus, SLOW_AFTER_MS } from "../lib/price-status"

export function usePriceStatus(query: UseQueryResult) {
  const [slow, setSlow] = useState(false)
  const waiting = query.isPending && query.fetchStatus === "fetching"

  useEffect(() => {
    if (!waiting) return
    const timer = setTimeout(() => {
      setSlow(true)
    }, SLOW_AFTER_MS)
    return () => {
      clearTimeout(timer)
    }
  }, [waiting])

  return {
    status: priceStatus({
      hasData: query.data !== undefined,
      isPending: query.isPending,
      fetchStatus: query.fetchStatus,
      slow,
      online: typeof navigator === "undefined" || navigator.onLine,
    }),
    retry: () => {
      void query.refetch()
    },
    isRetrying: query.isFetching && !query.isPending,
  }
}
