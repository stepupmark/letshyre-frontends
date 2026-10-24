export type PriceStatus = "loading" | "slow" | "offline" | "error" | "ready"

export const SLOW_AFTER_MS = 8000

/** A failed background refresh keeps the last prices on screen rather than taking them away. */
export function priceStatus({
  hasData,
  isPending,
  fetchStatus,
  slow,
  online,
}: {
  hasData: boolean
  isPending: boolean
  fetchStatus: "fetching" | "paused" | "idle"
  slow: boolean
  online: boolean
}): PriceStatus {
  if (hasData) return "ready"
  if (isPending && fetchStatus === "paused") return "offline"
  if (isPending) return slow ? "slow" : "loading"
  return online ? "error" : "offline"
}

export const isPricePending = (status: PriceStatus) =>
  status === "loading" || status === "slow"
