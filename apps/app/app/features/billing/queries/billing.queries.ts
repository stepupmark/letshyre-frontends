import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

import { invoicesPageSchema, quoteSchema } from "../schemas/billing.schema"
import type { OrderRequest } from "../types"

export const quoteQuery = ({ planId, credits, coupon }: OrderRequest) =>
  queryOptions({
    queryKey: ["billing", "quote", planId, credits, coupon ?? null],
    queryFn: async ({ signal }) =>
      quoteSchema.parse(
        dataOf(
          await api.get("payment/v1/employer/calculate-token-cost/", {
            query: { tokens: credits, plan_id: planId, coupon_code: coupon },
            signal,
          })
        )
      ),
    staleTime: 60_000,
  })

export const invoicesQuery = (page: number) =>
  queryOptions({
    queryKey: ["billing", "invoices", page],
    queryFn: async () =>
      invoicesPageSchema.parse(
        dataOf(
          await api.get("payment/v1/credit_purchase_history/", {
            query: { page, is_paid: true },
          })
        )
      ),
    staleTime: 30_000,
  })

export const INVOICES_KEY = ["billing", "invoices"] as const
