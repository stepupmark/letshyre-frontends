import { compactParams, pageOf, textOf } from "@/lib/search-params"

import type { UnlockedProfilesFilters } from "./schemas/unlocks.schema"

export function readUnlocksParams(params: URLSearchParams) {
  return {
    page: pageOf(params),
    q: textOf(params, "q"),
    from: textOf(params, "from"),
    to: textOf(params, "to"),
  }
}

export function toUnlocksFilters(
  params: ReturnType<typeof readUnlocksParams>
): UnlockedProfilesFilters {
  return {
    page: params.page,
    ...compactParams({
      search: params.q.trim(),
      start_date: params.from,
      end_date: params.to,
    }),
  }
}
