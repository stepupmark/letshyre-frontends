import { STALE_TIME } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { fetchUnlockedCandidateScorecard } from "@/features/employer/services/unlockedCandidateScorecard.service";
import { queryKeys } from "@/lib/queryKeys";

/**
 * React Query hook to fetch the scorecard for an unlocked candidate.
 * 
 * @param {string} id - The ID of the unlocked candidate record.
 */
export const useUnlockedCandidateScorecard = (id) => {
  return useQuery({
    queryKey: queryKeys.employer.unlockedCandidateScorecard(id),
    queryFn: () => fetchUnlockedCandidateScorecard(id),
    enabled: !!id, // Only fetch if ID is provided
    staleTime: STALE_TIME.MEDIUM,
  });
};
