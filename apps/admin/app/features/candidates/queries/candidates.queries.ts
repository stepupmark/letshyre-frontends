import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { CandidateFilters } from "../schemas/candidates.schema"
import { candidatesService } from "../services/candidates.service"

export const candidatesKeys = {
  all: ["candidates"] as const,
  list: (filters: CandidateFilters) =>
    [...candidatesKeys.all, "list", filters] as const,
  profile: (id: string) => [...candidatesKeys.all, "profile", id] as const,
  summary: () => [...candidatesKeys.all, "summary"] as const,
}

export const candidatesQueries = {
  list: (filters: CandidateFilters) =>
    queryOptions({
      queryKey: candidatesKeys.list(filters),
      queryFn: ({ signal }) => candidatesService.list(filters, signal),
      placeholderData: keepPreviousData,
    }),
  profile: (id: string) =>
    queryOptions({
      queryKey: candidatesKeys.profile(id),
      queryFn: ({ signal }) => candidatesService.profile(id, signal),
      // older profiles don't return the approval flags, so a refetch would drop
      // the ones merged in after a decision
      staleTime: 10 * 60_000,
    }),
  summary: () =>
    queryOptions({
      queryKey: candidatesKeys.summary(),
      queryFn: ({ signal }) => candidatesService.summary(signal),
      staleTime: 30_000,
    }),
}
