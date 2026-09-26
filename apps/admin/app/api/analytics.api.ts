import { http } from "~/lib/api/http-client";
import { toApiError } from "~/lib/api/api-error";

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

export const fetchSkillsChart = async (): Promise<SkillDataPoint[]> => {
  try {
    const response = await http.get<SkillsChartApiResponse>(
      "user/v1/admin/skills/pie-chart/",
    );
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const fetchTechnologyChart = async (): Promise<
  TechnologyDataPoint[]
> => {
  try {
    const response = await http.get<TechnologyChartApiResponse>(
      "user/v1/admin/candidate/experience/pie-chart/",
    );
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
};
