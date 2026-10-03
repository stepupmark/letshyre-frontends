import { useQuery, queryOptions } from "@tanstack/react-query";
import { getCandidateProfile } from "@/features/employee/services/candidateProfile.service";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME } from "@/lib/queryClient";

// Candidate profile, shared by the employee layout's shell-prefetch and every
// component that reads it (profile, scorecard, dashboard shell) so it can't drift.
export const candidateProfileQuery = () =>
  queryOptions({
    queryKey: queryKeys.employee.profile(),
    queryFn: getCandidateProfile,
    staleTime: STALE_TIME.MEDIUM,
  });

// Retained for the layout's optimistic setQueryData/invalidate; sourced from
// the factory so it stays in lockstep with the query above.
export const CANDIDATE_PROFILE_KEY = queryKeys.employee.profile();

export const useCandidateProfile = () => useQuery(candidateProfileQuery());
