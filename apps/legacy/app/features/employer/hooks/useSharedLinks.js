import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
  queryOptions,
} from "@tanstack/react-query";
import {
  createCandidateShareLink,
  fetchSharedLinks,
  updateSharedLink,
  deleteSharedLink,
} from "@/features/employer/services/sharedLinks.service";
import { useJobs } from "@/features/employer/hooks/useEmployerJobs";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME } from "@/lib/queryClient";

// Normalizes both the current bare-array `data` and a future paginated
// envelope into one stable shape, same approach as unlockedCandidatesQuery —
// so real pagination arrives without a component change.
export const sharedLinksQuery = (page = 1) =>
  queryOptions({
    queryKey: queryKeys.employer.sharedLinks.list(page),
    queryFn: async () => {
      const res = await fetchSharedLinks({ page });
      const response = res.data;
      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to fetch shared links",
        );
      }

      const d = response.data ?? [];
      const isArray = Array.isArray(d);
      const results = isArray ? d : d.results || [];

      return {
        results,
        count: isArray ? results.length : d.count ?? results.length,
        totalPages: isArray ? 1 : d.total_pages ?? 1,
        currentPage: isArray ? 1 : d.current_page ?? page,
        pageSize: isArray ? results.length : d.page_size ?? results.length,
      };
    },
    staleTime: STALE_TIME.SHORT,
  });

export const useSharedLinks = (page = 1) =>
  useQuery({
    ...sharedLinksQuery(page),
    placeholderData: keepPreviousData,
  });

export const useCreateShareLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ candidateId, payload }) =>
      createCandidateShareLink(candidateId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.employer.sharedLinks.all(),
      });
    },
  });
};

export const useUpdateShareLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateSharedLink(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.employer.sharedLinks.all(),
      });
    },
  });
};

export const useDeleteShareLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteSharedLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.employer.sharedLinks.all(),
      });
    },
  });
};

// Job options for the create-link dropdown, sourced from the existing open
// jobs list. Isolated here so swapping to a dedicated jobs-for-sharing API
// later is a one-line change — callers only ever see { value, label }.
export const useShareJobOptions = () => {
  const { data, isLoading, error } = useJobs({ page: 1 });
  const options = (data?.results || []).map((job) => ({
    value: job.id,
    label: job.title,
  }));
  return { options, isLoading, error };
};
