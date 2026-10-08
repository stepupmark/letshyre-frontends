import { z } from "zod"
import { envelope } from "@/lib/schemas"

const amount = z.coerce.number().catch(0)

const revenueSummarySchema = z.object({
  total_revenue: amount,
  today_revenue: amount,
  weekly_revenue: amount,
  monthly_revenue: amount,
  total_transactions: amount,
  avg_order_value: amount,
  total_credits_sold: amount,
})

// this endpoint has answered both wrapped and bare over time
export const revenueSummaryResponseSchema = z.union([
  envelope(revenueSummarySchema).transform((body) => body.data),
  revenueSummarySchema,
])

export const monthlyRevenueResponseSchema = envelope(
  z.array(z.object({ month: z.string(), revenue: amount }))
)

const share = z.object({ count: amount, percentage: amount })

export const skillsResponseSchema = envelope(
  z.array(share.extend({ skill: z.string() }))
)
export const technologiesResponseSchema = envelope(
  z.array(share.extend({ technology: z.string() }))
)

export const interviewInsightsResponseSchema = envelope(
  z.object({
    role_wise_performance: z
      .array(
        z.object({
          role: z.string(),
          avg_score: amount,
          total_candidates: amount,
          performance: z.string().nullish(),
        })
      )
      .nullish()
      .transform((value) => value ?? []),
    pass_fail_ratio: z
      .object({
        pass_count: amount,
        fail_count: amount,
        pass_percentage: amount,
        fail_percentage: amount,
      })
      .nullish(),
  })
)

export const activitySummaryResponseSchema = envelope(
  z.object({
    today_active: amount,
    weekly_active: amount,
    monthly_active: amount,
  })
)

export const dailyActivityResponseSchema = envelope(
  z.array(z.object({ date: z.string(), active_count: amount }))
)

export const ACTIVITY_RANGES = ["7", "14", "30"] as const
export type ActivityRange = (typeof ACTIVITY_RANGES)[number]

export interface Share {
  label: string
  count: number
  percentage: number
}
