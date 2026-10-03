import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
  queryOptions,
} from "@tanstack/react-query";
import {
  fetchJobs,
  getJobDetail,
  parseJD,
  createJob,
} from "@/features/employer/services/jobs.service";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME } from "@/lib/queryClient";

export const fetchJobsList = async ({ queryKey }) => {
  const [_key, params] = queryKey;

  // Drop "all" status so the API returns everything.
  const apiParams = { ...params };
  if (apiParams.status && apiParams.status.toLowerCase() === "all") {
    delete apiParams.status;
  }

  const res = await fetchJobs(apiParams);
  const responseData = res.data?.data || res.data;
  let jobsList = responseData?.results || [];

  jobsList = jobsList.map((j) => {
    const isApproved = String(j.job_status).toLowerCase() === "approved";
    return {
      ...j,
      isApproved,
      status: isApproved ? (j.status || "open").toLowerCase() : "pending",
    };
  });

  return {
    ...responseData,
    results: jobsList,
  };
};

// Paginated jobs list, shared with the view-jobs route prefetch so the keys match.
export const jobsListQuery = (params) =>
  queryOptions({
    queryKey: queryKeys.jobs.list(params),
    queryFn: fetchJobsList,
    staleTime: STALE_TIME.MEDIUM,
  });

// Single job detail, shared with the view-jobs.$jobId route prefetch.
export const jobDetailQuery = (jobId) =>
  queryOptions({
    queryKey: queryKeys.jobs.detail(jobId),
    queryFn: () => getJobDetail(jobId).then((res) => res.data?.data || res.data),
    staleTime: STALE_TIME.MEDIUM,
  });

export const useJobs = (params) => {
  return useQuery({
    ...jobsListQuery(params),
    // keep the previous page while the next loads
    placeholderData: keepPreviousData,
  });
};

export const useJobDetail = (jobId, enabled = true) => {
  return useQuery({
    ...jobDetailQuery(jobId),
    enabled,
  });
};

export const useParseJD = () => {
  return useMutation({
    mutationFn: (formData) => parseJD(formData),
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() });
    },
  });
};
