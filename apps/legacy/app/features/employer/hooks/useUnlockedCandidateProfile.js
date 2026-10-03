import { STALE_TIME } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { fetchUnlockedCandidateProfile } from "@/features/employer/services/unlockedCandidates.service";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Hook to fetch a specific unlocked candidate profile by ID.
 * @param {string} id - The ID of the unlocked candidate record.
 */
export const useUnlockedCandidateProfile = (id) => {
  return useQuery({
    queryKey: queryKeys.employer.unlockedCandidateProfile(id),
    queryFn: async () => {
      const response = await fetchUnlockedCandidateProfile(id);
      if (response?.success) {
        return response.data || null;
      }
      throw new Error(response?.message || "Failed to fetch candidate profile");
    },
    enabled: !!id, // Only run the query if an ID is provided
    staleTime: STALE_TIME.MEDIUM,
    retry: 1,
  });
};
