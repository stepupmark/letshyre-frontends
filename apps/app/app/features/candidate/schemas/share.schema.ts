import { z } from "zod"

import { dataOf } from "@/lib/response"

import { MAX_SHARE_DAYS } from "../lib/share"

const whole = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, message)
    .refine((value) => Number(value) >= min && Number(value) <= max, message)

export const makeShareSchema = (m: {
  job: string
  days: string
  views: string
}) =>
  z.object({
    job_id: z.string().min(1, m.job),
    expires_in_days: whole(1, MAX_SHARE_DAYS, m.days),
    max_views: whole(1, 1000, m.views),
  })

export type ShareValues = z.infer<ReturnType<typeof makeShareSchema>>

export const shareLinkSchema = z.looseObject({
  share_token: z.string(),
  expires_at: z.string().nullish(),
  max_views: z.number().nullish(),
})

export type ShareLink = z.infer<typeof shareLinkSchema>

const sharedLinkSchema = z.looseObject({
  id: z.union([z.string(), z.number()]).transform(String),
  share_token: z.string(),
  candidate_name: z.string().nullish(),
  candidate_role: z.string().nullish(),
  matched_job_title: z.string().nullish(),
  view_count: z.coerce.number().catch(0),
  max_views: z.coerce.number().nullish(),
  expires_at: z.string().nullish(),
  is_active: z.boolean().catch(true),
  is_expired: z.boolean().catch(false),
  has_reached_max_views: z.boolean().catch(false),
})

export type SharedLink = z.infer<typeof sharedLinkSchema>

// a bare list today, a paginated envelope later
export const sharedLinksPageSchema = z.preprocess(
  (json) => {
    const data = dataOf(json)
    return Array.isArray(data)
      ? { results: data, count: data.length, total_pages: 1 }
      : data
  },
  z.looseObject({
    results: z.array(sharedLinkSchema).catch([]),
    count: z.number().nullish(),
    total_pages: z.number().nullish(),
  })
)
