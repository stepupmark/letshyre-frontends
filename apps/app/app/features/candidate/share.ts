import { queryOptions } from "@tanstack/react-query"
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
export const shareUrl = (link: Pick<ShareLink, "share_token">) =>
  isShareId(link.share_token)
    ? `${window.location.origin}/shared-scorecard/${link.share_token}`
    : null

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

export const sharedLinksQuery = (page: number) =>
  queryOptions({
    queryKey: ["employer", "shared-links", page],
    queryFn: async () =>
      sharedLinksPageSchema.parse(
        await api.get("user/v1/employer_shared_links/", { query: { page } })
      ),
    staleTime: 30_000,
  })

export const SHARED_LINKS_KEY = ["employer", "shared-links"] as const

export type LinkState = "active" | "revoked" | "expired" | "used"

export const stateOf = (link: SharedLink): LinkState =>
  link.is_expired
    ? "expired"
    : link.has_reached_max_views
      ? "used"
      : link.is_active
        ? "active"
        : "revoked"

export const updateSharedLink = (
  id: string,
  body: Partial<{
    is_active: boolean
    max_views: number
    extend_expiry_days: number
  }>
) => api.patch(`user/v1/employer_shared_links/${id}/`, body)

export const deleteSharedLink = (id: string) =>
  api.delete(`user/v1/employer_shared_links/${id}/`)
