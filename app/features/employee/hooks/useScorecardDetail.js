import { useQuery, queryOptions } from "@tanstack/react-query";
import { getScorecardDetail } from "@/features/employee/services/scorecardDetail.service";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, retryExcept404 } from "@/lib/queryClient";

// Single scorecard detail, shared with the route prefetch so the keys match.
// `enabled` gates the component's useQuery when there's no id.
export const scorecardDetailQuery = (id) =>
  queryOptions({
    queryKey: queryKeys.employee.scorecardDetail(id),
    queryFn: () => getScorecardDetail(id),
    enabled: !!id,
    staleTime: STALE_TIME.SHORT,
    retry: retryExcept404,
  });

export const useScorecardDetail = (id) => useQuery(scorecardDetailQuery(id));
