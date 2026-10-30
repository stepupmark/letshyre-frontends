import { api } from "@/lib/api"

import { toQuery } from "../lib/params"
import type { SearchParams } from "../types"

export const searchCandidates = (params: SearchParams) =>
  api.get("user/v1/employer_interviewed_candidates_search/", {
    query: toQuery(params),
  })
