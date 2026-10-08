import { createLoader } from "nuqs"
import { compactParams, pageParser, textParser } from "~/lib/search-params"
import type { UnlockedProfilesFilters } from "./schemas/unlocks.schema"

export const unlocksSearchParams = {
  page: pageParser,
  q: textParser,
  from: textParser,
  to: textParser,
}

export const loadUnlocksSearchParams = createLoader(unlocksSearchParams)

export function toUnlocksFilters(params: {
  page: number
  q: string
  from: string
  to: string
}): UnlockedProfilesFilters {
  return {
    page: params.page,
    ...compactParams({
      search: params.q.trim(),
      start_date: params.from,
      end_date: params.to,
    }),
  }
}
