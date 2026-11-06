import type { UseQueryResult } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { priceStatus, SLOW_AFTER_MS } from "../lib/price-status"

export function usePriceStatus(query: UseQueryResult) {
  const [slowAt, setSlowAt] = useState<number | null>(null)
  const waiting = query.isPending && query.fetchStatus === "fetching"
  // each failure starts a new wait, so a retry gets its own grace period
  const attempt = query.errorUpdateCount
  const slow = waiting && slowAt === attempt

  useEffect(() => {
    if (!waiting) return
    const timer = setTimeout(() => {
      setSlowAt(attempt)
    }, SLOW_AFTER_MS)
    return () => {
      clearTimeout(timer)
    }
  }, [waiting, attempt])

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
