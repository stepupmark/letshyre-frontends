import { useQuery } from "@tanstack/react-query"

import { creditPriceQuery, plansQuery } from "@/lib/pricing"

import { mergePlans, PLANS } from "../lib/plans"
import { usePriceStatus } from "./use-price-status"

export function usePlans() {
  const query = useQuery(plansQuery())
  const status = usePriceStatus(query)
  const plans = query.data ? mergePlans(query.data) : PLANS
  return { ...status, plans }
}

export function useCreditCost() {
  const query = useQuery(creditPriceQuery())
  return {
    ...usePriceStatus(query),
    costPerCredit: query.data?.costPerCredit ?? null,
  }
}
