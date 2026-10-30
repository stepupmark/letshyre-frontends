import { queryOptions } from "@tanstack/react-query"

import { searchPageSchema } from "../schemas/candidate-search.schema"
import { searchCandidates } from "../services/candidate-search.service"
import type { SearchParams } from "../types"

export const SEARCH_KEY = ["employer", "candidate-search"] as const

export const searchQuery = (params: SearchParams) =>
  queryOptions({
    queryKey: [...SEARCH_KEY, params],
    queryFn: async () => searchPageSchema.parse(await searchCandidates(params)),
    enabled: params.search !== "",
    staleTime: 30_000,
  })
