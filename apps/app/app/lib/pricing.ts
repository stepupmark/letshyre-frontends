import { queryOptions } from "@tanstack/react-query"
import { getCreditPrice, getPublicPlans } from "@workspace/api/public"

import { api } from "./api"

export const plansQuery = () =>
  queryOptions({
    queryKey: ["billing", "plans"],
    queryFn: ({ signal }) => getPublicPlans(api, { signal }),
    staleTime: 5 * 60_000,
  })

export const creditPriceQuery = () =>
  queryOptions({
    queryKey: ["billing", "credit-price"],
    queryFn: ({ signal }) => getCreditPrice(api, { signal }),
    staleTime: 5 * 60_000,
  })
