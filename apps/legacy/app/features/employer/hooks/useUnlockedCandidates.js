import { STALE_TIME } from "@/lib/queryClient";
import {
  useQuery,
  keepPreviousData,
  queryOptions,
} from "@tanstack/react-query";
import { fetchUnlockedCandidates } from "@/features/employer/services/unlockedCandidates.service";
import { queryKeys } from "@/lib/queryKeys";

// A page of unlocked candidates. Normalizes both response shapes — the paginated
// envelope and older bare-array `data` — into one stable shape. Shared with the
// route prefetch so the keys match.
export const unlockedCandidatesQuery = (page = 1) =>
  queryOptions({
    queryKey: queryKeys.employer.unlockedCandidates.list(page),
    queryFn: async () => {
      const response = await fetchUnlockedCandidates({ page });
      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to fetch unlocked candidates",
        );
      }

      const d = response.data ?? {};
      const isArray = Array.isArray(d);
      const results = isArray ? d : d.results || [];

      return {
        results,
        count: isArray ? results.length : d.count ?? results.length,
        totalPages: isArray ? 1 : d.total_pages ?? 1,
        currentPage: isArray ? 1 : d.current_page ?? page,
        pageSize: isArray ? results.length : d.page_size ?? results.length,
        next: isArray ? null : d.next ?? null,
        previous: isArray ? null : d.previous ?? null,
      };
    },
    staleTime: STALE_TIME.MEDIUM,
    retry: 1,
  });

export const useUnlockedCandidates = (page = 1) =>
  useQuery({
    ...unlockedCandidatesQuery(page),
    // Keep the previous page visible while the next one loads (no flash).
    placeholderData: keepPreviousData,
  });
