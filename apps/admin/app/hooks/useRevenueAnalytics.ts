import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  fetchRevenueSummaryCards,
  fetchMonthlyRevenueGraph,
} from "../api/revenue.api";

export const useRevenueAnalytics = (year: number) => {
  const summaryCardsQuery = useQuery({
    queryKey: ["revenue", "cards"],
    queryFn: fetchRevenueSummaryCards,
    staleTime: 5 * 60 * 1000,
  });

  const monthlyRevenueQuery = useQuery({
    queryKey: ["revenue", "monthly", year],
    queryFn: () => fetchMonthlyRevenueGraph(year),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  return {
    summaryCards: summaryCardsQuery,
    monthlyRevenue: monthlyRevenueQuery,
    isLoading: summaryCardsQuery.isLoading || monthlyRevenueQuery.isLoading,
    isFetching: summaryCardsQuery.isFetching || monthlyRevenueQuery.isFetching,
    isError: summaryCardsQuery.isError || monthlyRevenueQuery.isError,
  };
};
