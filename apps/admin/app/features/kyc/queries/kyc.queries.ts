import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import type { KycStatus } from "@/lib/company-kyc"
import { kycService } from "../services/kyc.service"

export const kycKeys = {
  all: ["kyc"] as const,
  list: (page: number, status: KycStatus) =>
    [...kycKeys.all, "list", { page, status }] as const,
  detail: (id: string) => [...kycKeys.all, "detail", id] as const,
}

export const kycQueries = {
  list: (page: number, status: KycStatus) =>
    queryOptions({
      queryKey: kycKeys.list(page, status),
      queryFn: ({ signal }) => kycService.list(page, status, signal),
      placeholderData: keepPreviousData,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: kycKeys.detail(id),
      queryFn: ({ signal }) => kycService.detail(id, signal),
    }),
}
