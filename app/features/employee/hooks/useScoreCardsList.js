import { useQuery, queryOptions } from "@tanstack/react-query";
import { getCandidateScorecard } from "@/features/employee/services/scorecard.service";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, retryExcept404 } from "@/lib/queryClient";

/**
 * Candidate scorecard list, shared between the route's clientLoader prefetch
 * (employee.score-cards-list.jsx) and the component so the prefetched key and
 * the read key are identical by construction.
 */
export const scoreCardsListQuery = () =>
  queryOptions({
    queryKey: queryKeys.employee.scoreCardsList(),
    queryFn: getCandidateScorecard,
    staleTime: STALE_TIME.SHORT,
    retry: retryExcept404,
  });

export const useScoreCardsList = () => useQuery(scoreCardsListQuery());
