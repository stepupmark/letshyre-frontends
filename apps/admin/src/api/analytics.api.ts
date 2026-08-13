/**
 * analytics.api.ts
 *
 * API functions for dashboard analytics charts.
 * Handles skills distribution and technology distribution endpoints.
 */

import { apiClient } from "./axiosInstance";
import { extractMessage } from "./apiError";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SkillDataPoint {
  skill: string;
  count: number;
  percentage: number;
}

export interface SkillsChartApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: SkillDataPoint[];
}

export interface TechnologyDataPoint {
  technology: string;
  count: number;
  percentage: number;
}

export interface TechnologyChartApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: TechnologyDataPoint[];
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

export const fetchSkillsChart = async (): Promise<SkillDataPoint[]> => {
  try {
    const response = await apiClient.get<SkillsChartApiResponse>(
      "user/v1/admin/skills/pie-chart/",
    );
    return response.data.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};

export const fetchTechnologyChart = async (): Promise<TechnologyDataPoint[]> => {
  try {
    const response = await apiClient.get<TechnologyChartApiResponse>(
      "user/v1/admin/candidate/experience/pie-chart/",
    );
    return response.data.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};
