import { compactParams, oneOf, pageOf, textOf } from "@/lib/search-params"

import {
  GENDERS,
  INDUSTRIES,
  type CandidateFilters,
} from "./schemas/candidates.schema"

export function readCandidatesParams(params: URLSearchParams) {
  return {
    page: pageOf(params),
    q: textOf(params, "q"),
    gender: oneOf(params.get("gender"), GENDERS),
    industry: oneOf(params.get("industry"), INDUSTRIES),
    kyc: oneOf(params.get("kyc"), ["verified", "unverified"]),
    profile: oneOf(params.get("profile"), ["complete", "incomplete"]),
  }
}

export function toCandidateFilters(
  params: ReturnType<typeof readCandidatesParams>
): CandidateFilters {
  return {
    page: params.page,
    ...compactParams({
      search: params.q.trim(),
      gender: params.gender,
      preferred_industry: params.industry,
      is_verified: params.kyc ? params.kyc === "verified" : null,
      is_profile_complete: params.profile
        ? params.profile === "complete"
        : null,
    }),
  }
}
