import { z } from "zod"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

import { isShareId } from "./shared-query"

export const MAX_SHARE_DAYS = 30

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

const shareLinkSchema = z.looseObject({
  share_token: z.string(),
  expires_at: z.string().nullish(),
  max_views: z.number().nullish(),
})
export type ShareLink = z.infer<typeof shareLinkSchema>

export const createShareLink = async (unlockId: string, values: ShareValues) =>
  shareLinkSchema.parse(
    dataOf(
      await api.post(`user/v1/employer_unlock_candidate/${unlockId}/share/`, {
        job_id: values.job_id,
        expires_in_days: Number(values.expires_in_days),
        max_views: Number(values.max_views),
        match_engine: "v1",
      })
    )
  )

// the API's share_url points at its own host, so the link is built here
export const shareUrl = (link: ShareLink) =>
  isShareId(link.share_token)
    ? `${window.location.origin}/shared-scorecard/${link.share_token}`
    : null
