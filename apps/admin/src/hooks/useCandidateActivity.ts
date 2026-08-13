import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  fetchCandidateActivitySummary,
  fetchDayWiseActivity,
} from "../api/candidateActivity.api";

export const CANDIDATE_ACTIVITY_QUERY_KEYS = {
  summary: ["candidate-activity", "summary"] as const,
  dayWise: (days: number) => ["candidate-activity", "day-wise", days] as const,
};

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

export const useCandidateActivitySummary = () => {
  return useQuery({
    queryKey: CANDIDATE_ACTIVITY_QUERY_KEYS.summary,
    queryFn: fetchCandidateActivitySummary,
    staleTime: STALE_TIME,
  });
};

export const useCandidateActivityTrend = (days: number = 7) => {
  return useQuery({
    queryKey: CANDIDATE_ACTIVITY_QUERY_KEYS.dayWise(days),
    queryFn: () => fetchDayWiseActivity(days),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
};
