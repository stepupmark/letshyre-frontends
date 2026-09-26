import { http } from "~/lib/api/http-client";
import { toApiError } from "~/lib/api/api-error";

export interface ActivitySummaryData {
  today_active: number;
  weekly_active: number;
  monthly_active: number;
}

export interface ActivitySummaryResponse {
  success: boolean;
  status: number;
  message: string;
  data: ActivitySummaryData;
}

export interface DayWiseActivityData {
  date: string;
  active_count: number;
}

export interface DayWiseActivityResponse {
  success: boolean;
  status: number;
  message: string;
  data: DayWiseActivityData[];
}

export const fetchCandidateActivitySummary =
  async (): Promise<ActivitySummaryData> => {
    try {
      const response = await http.get<ActivitySummaryResponse>(
        `user/v1/admin/candidates/activity-analytics/`,
      );
      return response.data.data;
    } catch (err) {
      throw toApiError(err);
    }
  };

export const fetchDayWiseActivity = async (
  days: number = 7,
): Promise<DayWiseActivityData[]> => {
  try {
    const response = await http.get<DayWiseActivityResponse>(
      `user/v1/admin/candidates/activity/day-wise/?days=${days}`,
    );
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
};
