import { z } from "zod"

const count = z.number().nullish()

export const cardsSchema = z.looseObject({
  active_jobs: count,
  in_active_jobs: count,
  total_applications: count,
  credits: z.looseObject({ usage_percent: count, available: count }).nullish(),
})

export type Cards = z.infer<typeof cardsSchema>

export const teamSchema = z.looseObject({ count })
