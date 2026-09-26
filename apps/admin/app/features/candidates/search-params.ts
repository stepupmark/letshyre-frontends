import { createLoader, parseAsStringLiteral } from "nuqs";
import { compactParams, pageParser, textParser } from "~/lib/search-params";
import {
  GENDERS,
  INDUSTRIES,
  type CandidateFilters,
} from "./schemas/candidates.schema";

export const candidatesSearchParams = {
  page: pageParser,
  q: textParser,
  gender: parseAsStringLiteral(GENDERS),
  industry: parseAsStringLiteral(INDUSTRIES),
  kyc: parseAsStringLiteral(["verified", "unverified"]),
  profile: parseAsStringLiteral(["complete", "incomplete"]),
};

export const loadCandidatesSearchParams = createLoader(candidatesSearchParams);

type Params = {
  page: number;
  q: string;
  gender: string | null;
  industry: string | null;
  kyc: string | null;
  profile: string | null;
};

export function toCandidateFilters(params: Params): CandidateFilters {
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
  };
}
