import { queryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

const count = z.number().nullish()

export const cardsSchema = z.looseObject({
  active_jobs: count,
  in_active_jobs: count,
  total_applications: count,
  credits: z.looseObject({ usage_percent: count, available: count }).nullish(),
})
export type Cards = z.infer<typeof cardsSchema>

export const teamSchema = z.looseObject({ count })

export const cardsQuery = () =>
  queryOptions({
    queryKey: ["employer", "dashboard-cards"],
    queryFn: async () =>
      cardsSchema.parse(
        dataOf(await api.get("user/v1/employer_dashboard_cards/"))
      ),
    staleTime: 30_000,
  })

export const teamQuery = () =>
  queryOptions({
    queryKey: ["employer", "team-summary"],
    queryFn: async () =>
      teamSchema.parse(dataOf(await api.get("user/v1/employer_team_members/"))),
    staleTime: 5 * 60_000,
  })

/** One unlock costs one credit; below this the dashboard warns. */
export const LOW_CREDITS = 3
