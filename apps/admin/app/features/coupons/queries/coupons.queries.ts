import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { couponsService } from "../services/coupons.service"

export const couponsKeys = {
  all: ["coupons"] as const,
  list: (page: number) => [...couponsKeys.all, "list", page] as const,
}

export const couponsQueries = {
  list: (page: number) =>
    queryOptions({
      queryKey: couponsKeys.list(page),
      queryFn: ({ signal }) => couponsService.list(page, signal),
      placeholderData: keepPreviousData,
    }),
}
