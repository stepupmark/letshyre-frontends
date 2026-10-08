import { z } from "zod"
import { envelope, paginated } from "~/lib/api/schemas"

const count = z
  .number()
  .nullish()
  .transform((value) => value ?? 0)

const unlocksOverviewSchema = z.object({
  summary: z.object({
    total_unlocks: count,
    today_unlocks: count,
    week_unlocks: count,
    month_unlocks: count,
  }),
  growth: z
    .object({
      today_vs_yesterday: z.number().nullish(),
      week_vs_last_week: z.number().nullish(),
      month_vs_last_month: z.number().nullish(),
    })
    .nullish(),
  engagement: z.object({
    unique_employers: count,
    unique_candidates: count,
    avg_ai_score: count,
  }),
  top_performer: z
    .object({
      top_employer: z
        .object({
          employer__user__name: z.string().nullish(),
          total: count,
        })
        .nullish(),
    })
    .nullish(),
})

const unlockedProfileSchema = z.object({
  employer: z.string().nullish(),
  candidate: z.string().nullish(),
  candidate_name: z.string().nullish(),
  candidate_email: z.string().nullish(),
  candidate_phone: z.string().nullish(),
  candidate_resume: z.string().nullish(),
  interview: z.string().nullish(),
  ai_overall_score: z.union([z.string(), z.number()]).nullish(),
  unlocked_date: z.string(),
})

export const unlocksOverviewResponseSchema = envelope(unlocksOverviewSchema)
export const unlockedProfilesResponseSchema = envelope(
  paginated(unlockedProfileSchema)
)

export type UnlockedProfile = z.infer<typeof unlockedProfileSchema>
export type UnlockedProfilesFilters = {
  page: number
  search?: string
  start_date?: string
  end_date?: string
}
