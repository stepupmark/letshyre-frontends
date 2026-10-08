import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import type { PaymentFilters } from "../schemas/payments.schema"
import { paymentsService } from "../services/payments.service"

const paymentsKeys = {
  all: ["payments"] as const,
  summary: () => [...paymentsKeys.all, "summary"] as const,
  list: (filters: PaymentFilters) =>
    [...paymentsKeys.all, "list", filters] as const,
}

export const paymentsQueries = {
  summary: () =>
    queryOptions({
      queryKey: paymentsKeys.summary(),
      queryFn: ({ signal }) => paymentsService.summary(signal),
      staleTime: 5 * 60_000,
    }),
  list: (filters: PaymentFilters) =>
    queryOptions({
      queryKey: paymentsKeys.list(filters),
      queryFn: ({ signal }) => paymentsService.list(filters, signal),
      placeholderData: keepPreviousData,
    }),
}
