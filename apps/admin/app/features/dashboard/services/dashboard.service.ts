import type { Query } from "@workspace/api"

import { api } from "@/lib/api"

import {
  activitySummaryResponseSchema,
  dailyActivityResponseSchema,
  interviewInsightsResponseSchema,
  monthlyRevenueResponseSchema,
  revenueSummaryResponseSchema,
  skillsResponseSchema,
  technologiesResponseSchema,
} from "../schemas/dashboard.schema"
import { toShares } from "../utils/shares"

const get = (url: string, signal?: AbortSignal, query?: Query) =>
  api.get(url, { signal, query })

export const dashboardService = {
  async revenueSummary(signal?: AbortSignal) {
    return revenueSummaryResponseSchema.parse(
      await get("user/v1/admin/revenue/cards/", signal)
    )
  },

  async monthlyRevenue(year: number, signal?: AbortSignal) {
    return monthlyRevenueResponseSchema.parse(
      await get("user/v1/admin/monthly/revenues/bar_graph/", signal, { year })
    ).data
  },

  async skills(signal?: AbortSignal) {
    const { data } = skillsResponseSchema.parse(
      await get("user/v1/admin/skills/pie-chart/", signal)
    )
    return toShares(data.map((item) => ({ ...item, name: item.skill })))
  },

  async technologies(signal?: AbortSignal) {
    const { data } = technologiesResponseSchema.parse(
      await get("user/v1/admin/candidate/experience/pie-chart/", signal)
    )
    return toShares(data.map((item) => ({ ...item, name: item.technology })))
  },

  async interviewInsights(signal?: AbortSignal) {
    return interviewInsightsResponseSchema.parse(
      await get("user/v1/admin/ai-interview/insights/", signal)
    ).data
  },

  async activitySummary(signal?: AbortSignal) {
    return activitySummaryResponseSchema.parse(
      await get("user/v1/admin/candidates/activity-analytics/", signal)
    ).data
  },

  async dailyActivity(days: number, signal?: AbortSignal) {
    return dailyActivityResponseSchema.parse(
      await get("user/v1/admin/candidates/activity/day-wise/", signal, {
        days,
      })
    ).data
  },
}
