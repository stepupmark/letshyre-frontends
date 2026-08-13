import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchSkillsChart, fetchTechnologyChart } from "../api/analytics.api";
import {
  transformSkillsData,
  transformTechnologyData,
  type ChartSlice,
} from "../lib/chartTransformers";

export const ANALYTICS_QUERY_KEYS = {
  skills: ["analytics", "skills-chart"] as const,
  technology: ["analytics", "technology-chart"] as const,
};

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

export interface AnalyticsChartsResult {
  skills: {
    data: ChartSlice[] | undefined;
    isLoading: boolean;
    isError: boolean;
  };
  technology: {
    data: ChartSlice[] | undefined;
    isLoading: boolean;
    isError: boolean;
  };
  /** true while ANY query is still in-flight */
  isAnyLoading: boolean;
}

export const useAnalyticsCharts = (): AnalyticsChartsResult => {
  const [skillsQuery, techQuery] = useQueries({
    queries: [
      {
        queryKey: ANALYTICS_QUERY_KEYS.skills,
        queryFn: async (): Promise<ChartSlice[]> => {
          const raw = await fetchSkillsChart();
          return transformSkillsData(raw);
        },
        staleTime: STALE_TIME,
      },
      {
        queryKey: ANALYTICS_QUERY_KEYS.technology,
        queryFn: async (): Promise<ChartSlice[]> => {
          const raw = await fetchTechnologyChart();
          return transformTechnologyData(raw);
        },
        staleTime: STALE_TIME,
      },
    ],
  });

  return {
    skills: {
      data: skillsQuery.data,
      isLoading: skillsQuery.isLoading,
      isError: skillsQuery.isError,
    },
    technology: {
      data: techQuery.data,
      isLoading: techQuery.isLoading,
      isError: techQuery.isError,
    },
    isAnyLoading: skillsQuery.isLoading || techQuery.isLoading,
  };
};

export const useSkillsChart = () =>
  useQuery<ChartSlice[]>({
    queryKey: ANALYTICS_QUERY_KEYS.skills,
    queryFn: async () => transformSkillsData(await fetchSkillsChart()),
    staleTime: STALE_TIME,
  });

export const useTechnologyChart = () =>
  useQuery<ChartSlice[]>({
    queryKey: ANALYTICS_QUERY_KEYS.technology,
    queryFn: async () => transformTechnologyData(await fetchTechnologyChart()),
    staleTime: STALE_TIME,
  });
