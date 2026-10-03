import { useInfiniteQuery, infiniteQueryOptions } from "@tanstack/react-query";
import { getCandidateApplications } from "@/features/employee/services/applications.service";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME } from "@/lib/queryClient";

// Infinite candidate applications for a tab/status, shared with the route
// prefetch. The pagination config (initialPageParam/getNextPageParam) lives here
// too, or the warmed entry won't match what useInfiniteQuery asks for.
export const applicationsQuery = (status) =>
  infiniteQueryOptions({
    queryKey: queryKeys.employee.applicationsList(status),
    queryFn: ({ pageParam = 1 }) =>
      getCandidateApplications({ pageParam, status }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: STALE_TIME.SHORT,
  });

export const useCandidateApplications = (status) =>
  useInfiniteQuery(applicationsQuery(status));
