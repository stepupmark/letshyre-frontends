import { STALE_TIME } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { getApplicants } from "@/features/employer/services/applicant.service";
import { queryKeys } from "@/lib/queryKeys";

export const useApplicants = (jobId, page) => {
  return useQuery({
    queryKey: queryKeys.employer.applicants(jobId, page),
    queryFn: () => getApplicants(jobId, page),
    enabled: !!jobId,
    placeholderData: (previousData) => previousData, // Keeps previous data on screen while fetching next page
    staleTime: STALE_TIME.MEDIUM,
  });
};
