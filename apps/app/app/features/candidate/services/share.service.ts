import { payloadOf } from "@workspace/api"

import { api } from "@/lib/api"

import type { ShareValues } from "../schemas/share.schema"
import { shareLinkSchema } from "../schemas/share.schema"

export const createShareLink = async (unlockId: string, values: ShareValues) =>
  shareLinkSchema.parse(
    payloadOf(
      await api.post(`user/v1/employer_unlock_candidate/${unlockId}/share/`, {
        job_id: values.job_id,
        expires_in_days: Number(values.expires_in_days),
        max_views: Number(values.max_views),
        match_engine: "v1",
      })
    )
  )

export const updateSharedLink = async (
  id: string,
  body: Partial<{
    is_active: boolean
    max_views: number
    extend_expiry_days: number
  }>
) => payloadOf(await api.patch(`user/v1/employer_shared_links/${id}/`, body))

export const deleteSharedLink = async (id: string) =>
  payloadOf(await api.delete(`user/v1/employer_shared_links/${id}/`))
