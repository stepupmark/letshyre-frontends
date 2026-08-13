import { apiClient } from "./axiosInstance";
import { extractMessage } from "./apiError";

export interface RevenueSummaryCardsResponse {
  total_revenue: number;
  today_revenue: number;
  weekly_revenue: number;
  monthly_revenue: number;
  total_transactions: number;
  avg_order_value: number;
  total_credits_sold: number;
}

export interface RevenueSummaryCardsApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: RevenueSummaryCardsResponse;
}

export interface MonthlyRevenueDataPoint {
  month: string;
  revenue: number;
}

export interface MonthlyRevenueApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: MonthlyRevenueDataPoint[];
}

export const fetchRevenueSummaryCards = async (): Promise<RevenueSummaryCardsResponse> => {
  try {
    const response = await apiClient.get<RevenueSummaryCardsApiResponse | RevenueSummaryCardsResponse>("user/v1/admin/revenue/cards/");

    // Handle both { data: {...} } and direct {...} responses
    const data = response.data;
    if ('success' in data && 'data' in data) {
      return (data as RevenueSummaryCardsApiResponse).data;
    }
    return data as RevenueSummaryCardsResponse;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};

export const fetchMonthlyRevenueGraph = async (year: number): Promise<MonthlyRevenueDataPoint[]> => {
  try {
    // Using user/v1/ prefix assuming it's part of the user service like the summary cards
    const response = await apiClient.get<MonthlyRevenueApiResponse>(`user/v1/admin/monthly/revenues/bar_graph/?year=${year}`);
    return response.data.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};
