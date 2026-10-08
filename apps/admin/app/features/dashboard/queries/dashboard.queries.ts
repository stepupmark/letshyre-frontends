import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { dashboardService } from "../services/dashboard.service"

const FIVE_MINUTES = 5 * 60_000

const dashboardKeys = {
  all: ["dashboard"] as const,
  revenueSummary: () => [...dashboardKeys.all, "revenue"] as const,
  monthlyRevenue: (year: number) =>
    [...dashboardKeys.all, "revenue", year] as const,
  skills: () => [...dashboardKeys.all, "skills"] as const,
  technologies: () => [...dashboardKeys.all, "technologies"] as const,
  interview: () => [...dashboardKeys.all, "interview"] as const,
  activitySummary: () => [...dashboardKeys.all, "activity"] as const,
  dailyActivity: (days: number) =>
    [...dashboardKeys.all, "activity", days] as const,
}

export const dashboardQueries = {
  revenueSummary: () =>
    queryOptions({
      queryKey: dashboardKeys.revenueSummary(),
      queryFn: ({ signal }) => dashboardService.revenueSummary(signal),
      staleTime: FIVE_MINUTES,
    }),
  monthlyRevenue: (year: number) =>
    queryOptions({
      queryKey: dashboardKeys.monthlyRevenue(year),
      queryFn: ({ signal }) => dashboardService.monthlyRevenue(year, signal),
      staleTime: FIVE_MINUTES,
      placeholderData: keepPreviousData,
    }),
  skills: () =>
    queryOptions({
      queryKey: dashboardKeys.skills(),
      queryFn: ({ signal }) => dashboardService.skills(signal),
      staleTime: FIVE_MINUTES,
    }),
  technologies: () =>
    queryOptions({
      queryKey: dashboardKeys.technologies(),
      queryFn: ({ signal }) => dashboardService.technologies(signal),
      staleTime: FIVE_MINUTES,
    }),
  interview: () =>
    queryOptions({
      queryKey: dashboardKeys.interview(),
      queryFn: ({ signal }) => dashboardService.interviewInsights(signal),
      staleTime: FIVE_MINUTES,
    }),
  activitySummary: () =>
    queryOptions({
      queryKey: dashboardKeys.activitySummary(),
      queryFn: ({ signal }) => dashboardService.activitySummary(signal),
      staleTime: FIVE_MINUTES,
    }),
  dailyActivity: (days: number) =>
    queryOptions({
      queryKey: dashboardKeys.dailyActivity(days),
      queryFn: ({ signal }) => dashboardService.dailyActivity(days, signal),
      staleTime: FIVE_MINUTES,
      placeholderData: keepPreviousData,
    }),
}
