import { queryOptions, useQuery } from "@tanstack/react-query"
import { getCreditPrice, getPublicPlans } from "@workspace/api/public"

import { api } from "@/lib/api"

// the http client already retries GETs that can succeed on a second try
export const publicPlansQuery = () =>
  queryOptions({
    queryKey: ["pricing", "plans"],
    queryFn: ({ signal }) => getPublicPlans(api, { signal }),
  })

export const creditPriceQuery = () =>
  queryOptions({
    queryKey: ["pricing", "creditPrice"],
    queryFn: ({ signal }) => getCreditPrice(api, { signal }),
  })

export const usePublicPlans = () => useQuery(publicPlansQuery())

export const useCreditPrice = () => useQuery(creditPriceQuery())
