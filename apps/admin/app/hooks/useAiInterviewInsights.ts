import { useQuery } from "@tanstack/react-query";
import {
  fetchAiInterviewInsights,
  AiInterviewInsightsData,
} from "../api/aiInterview.api";

export const AI_INTERVIEW_QUERY_KEYS = {
  insights: ["ai-interview", "insights"] as const,
};

const STALE_TIME = 1000 * 60 * 5;

export const useAiInterviewInsights = () => {
  return useQuery<AiInterviewInsightsData>({
    queryKey: AI_INTERVIEW_QUERY_KEYS.insights,
    queryFn: fetchAiInterviewInsights,
    staleTime: STALE_TIME,
  });
};
