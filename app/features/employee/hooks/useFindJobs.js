import { STALE_TIME } from "@/lib/queryClient";
import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import {
  getCandidateFindJobs,
  applyForJob,
} from "@/features/employee/services/findJobs.service";
import { queryKeys } from "@/lib/queryKeys";

// Filter state FindJobs mounts with. Exported so the loader prefetches the exact
// same key — TanStack hashes the whole object, so a missing field is a cache miss.
export const INITIAL_FIND_JOBS_FILTERS = {
  job_search: "",
  location: "",
  employment_type: "",
  industry_type: "",
  salary_range: "",
  experience_required: "",
  page: 1,
};

// Server-filtered job listing. `filters`: any of job_search, location,
// employment_type, industry_type, salary_range, experience_required, page.
export const findJobsQuery = (filters = {}) =>
  queryOptions({
    queryKey: queryKeys.employee.findJobsList(filters),
    queryFn: () => getCandidateFindJobs(filters),
    staleTime: STALE_TIME.MEDIUM,
  });

export const useFindJobs = (filters = {}) => {
  return useQuery({
    ...findJobsQuery(filters),
    placeholderData: (previousData) => previousData, // keep previous page while the next loads
  });
};

// Re-exported from the canonical hook so every caller shares one cache entry.

// Apply for a job; invalidates the jobs list so the "Applied" badge shows at once.
export const useApplyForJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId) => applyForJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employee.findJobs() });
      // The freshly-applied job now belongs in My Applications — refresh every
      // tab so it shows without waiting for staleTime to lapse.
      queryClient.invalidateQueries({
        queryKey: queryKeys.employee.applications(),
      });
    },
  });
};
