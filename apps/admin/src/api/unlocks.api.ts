import { apiClient } from "./axiosInstance";
import { extractMessage } from "./apiError";

export interface UnlocksDashboardData {
  summary: {
    total_unlocks: number;
    today_unlocks: number;
    week_unlocks: number;
    month_unlocks: number;
  };
  growth: {
    today_vs_yesterday: number;
    week_vs_last_week: number;
    month_vs_last_month: number;
  };
  engagement: {
    unique_employers: number;
    unique_candidates: number;
    avg_ai_score: number;
  };
  top_performer: {
    top_employer: {
      employer__user__name: string;
      total: number;
    };
  };
  trend: {
    date: string;
    count: number;
  }[];
}

export interface UnlockedProfile {
  employer: string;
  candidate: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  candidate_location: string | null;
  candidate_resume: string | null;
  interview: string;
  interview_video: string | null;
  ai_overall_score: string;
  unlocked_date: string;
}

export interface UnlockedProfilesResponse {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: UnlockedProfile[];
}

export interface FetchUnlockedProfilesParams {
  page?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export const fetchUnlocksDashboardCards =
  async (): Promise<UnlocksDashboardData> => {
    try {
      const response = await apiClient.get(
        `user/v1/admin/unlocked_profiles/cards/`,
      );
      return response.data.data;
    } catch (err) {
      throw new Error(extractMessage(err));
    }
  };

export const fetchUnlockedProfilesTable = async (
  params: FetchUnlockedProfilesParams,
): Promise<UnlockedProfilesResponse> => {
  try {
    const response = await apiClient.get(
      `user/v1/admin/employer/unlocked-profiles/`,
      {
        params,
      },
    );
    return response.data.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};
