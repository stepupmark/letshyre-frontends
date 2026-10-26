import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { UnlockedProfilesFilters } from "../schemas/unlocks.schema"
import { unlocksService } from "../services/unlocks.service"

const unlocksKeys = {
  all: ["unlocks"] as const,
  overview: () => [...unlocksKeys.all, "overview"] as const,
  list: (filters: UnlockedProfilesFilters) =>
    [...unlocksKeys.all, "list", filters] as const,
}

export const unlocksQueries = {
  overview: () =>
    queryOptions({
      queryKey: unlocksKeys.overview(),
      queryFn: ({ signal }) => unlocksService.overview(signal),
      staleTime: 5 * 60_000,
    }),
  list: (filters: UnlockedProfilesFilters) =>
    queryOptions({
      queryKey: unlocksKeys.list(filters),
      queryFn: ({ signal }) => unlocksService.list(filters, signal),
      placeholderData: keepPreviousData,
    }),
}
