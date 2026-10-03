import { STALE_TIME } from "@/lib/queryClient";
import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import {
  fetchOpenJobs,
  fetchAIMatchedCandidates,
  fetchCandidateInterviews,
  unlockCandidateProfile,
} from "@/features/employer/services/candidatePool.service";
import { queryKeys } from "@/lib/queryKeys";

export const openJobsQuery = (page = 1) =>
  queryOptions({
    queryKey: queryKeys.employer.openJobs({ page, status: "Open" }),
    queryFn: async () => {
      const res = await fetchOpenJobs({ page });
      const responseData = res.data?.data || res.data;
      return {
        results: responseData?.results || [],
        count: responseData?.count || 0,
        total_pages: responseData?.total_pages || 1,
        current_page: responseData?.current_page || 1,
      };
    },
    staleTime: STALE_TIME.MEDIUM,
  });

export const useOpenJobs = (page = 1) => {
  return useQuery({
    ...openJobsQuery(page),
    placeholderData: (previousData) => previousData,
  });
};

export const aiMatchedCandidatesQuery = (jobId, appliedOnly = false) =>
  queryOptions({
    queryKey: queryKeys.employer.aiMatchedCandidates(jobId, { appliedOnly }),
    queryFn: async () => {
      const res = await fetchAIMatchedCandidates(jobId, { appliedOnly });
      const responseData = res.data?.data || res.data;
      return {
        matches: responseData?.matches || [],
        total_candidates: responseData?.total_candidates || 0,
        matched_candidates_count: responseData?.matched_candidates_count || 0,
        ai_total_candidates: responseData?.ai_total_candidates || 0,
      };
    },
    enabled: !!jobId,
    staleTime: STALE_TIME.MEDIUM,
  });

export const useAIMatchedCandidates = (jobId, appliedOnly = false) => {
  return useQuery(aiMatchedCandidatesQuery(jobId, appliedOnly));
};

/**
 * Fetch past interviews for a specific candidate.
 */
export const useCandidateInterviews = (candidateId) => {
  return useQuery({
    queryKey: queryKeys.employer.candidateInterviews(candidateId),
    queryFn: async () => {
      const res = await fetchCandidateInterviews(candidateId);
      return res.data?.data || [];
    },
    enabled: !!candidateId,
  });
};

/**
 * Unlock a candidate profile with selected interviews.
 */
export const useUnlockCandidateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await unlockCandidateProfile(data);
      return res.data;
    },
    onSuccess: (data, variables) => {
      if (variables?.candidate) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.employer.candidateInterviews(variables.candidate),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.employer.unlockedCandidates.all(),
      });
    },
  });
};
