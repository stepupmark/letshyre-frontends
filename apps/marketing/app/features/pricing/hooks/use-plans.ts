import { useMemo } from "react"

import { mergePlans, PLANS } from "../lib/plans"
import { useCreditPrice, usePublicPlans } from "../queries/pricing.queries"
import { usePriceStatus } from "./use-price-status"

export function usePlans() {
  const query = usePublicPlans()
  const status = usePriceStatus(query)
  const plans = useMemo(
    () => (query.data ? mergePlans(query.data) : PLANS),
    [query.data]
  )
  return { ...status, plans }
}

export function useCreditCost() {
  const query = useCreditPrice()
  return {
    ...usePriceStatus(query),
    costPerCredit: query.data?.costPerCredit ?? null,
  }
}
