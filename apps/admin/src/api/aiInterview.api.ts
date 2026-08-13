

import { apiClient } from "./axiosInstance";
import { extractMessage } from "./apiError";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoleWisePerformance {
  role: string;
  avg_score: number;
  total_candidates: number;
  performance: string;
}

export interface PassFailRatio {
  pass_count: number;
  fail_count: number;
  pass_percentage: number;
  fail_percentage: number;
}

export interface AiInterviewInsightsData {
  role_wise_performance: RoleWisePerformance[];
  pass_fail_ratio: PassFailRatio;
}

export interface AiInterviewInsightsResponse {
  success: boolean;
  status: number;
  message: string;
  data: AiInterviewInsightsData;
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

export const fetchAiInterviewInsights = async (): Promise<AiInterviewInsightsData> => {
  try {
    const response = await apiClient.get<AiInterviewInsightsResponse>(
      "user/v1/admin/ai-interview/insights/"
    );
    return response.data.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};
