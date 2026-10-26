import { api } from "@/lib/api"

import {
  candidateProfileResponseSchema,
  candidateSummaryResponseSchema,
  candidatesResponseSchema,
  type CandidateDecision,
  type CandidateFilters,
} from "../schemas/candidates.schema"

const profileUrl = (id: string) =>
  `user/v1/admin/candidate_profile/${encodeURIComponent(id)}/`

export const candidatesService = {
  async list(filters: CandidateFilters, signal?: AbortSignal) {
    const data = await api.get("user/v1/admin/candidates/", {
      query: { ...filters },
      signal,
    })
    return candidatesResponseSchema.parse(data).data
  },

  async profile(id: string, signal?: AbortSignal) {
    const data = await api.get(profileUrl(id), { signal })
    return candidateProfileResponseSchema.parse(data).data
  },

  async summary(signal?: AbortSignal) {
    const data = await api.get("user/v1/admin/candidate/dashboard/cards/", {
      signal,
    })
    return candidateSummaryResponseSchema.parse(data).data
  },

  async decide(id: string, decision: CandidateDecision) {
    await api.put(
      profileUrl(id),
      decision === "approve" ? { is_approved: true } : { is_rejected: true }
    )
  },
}
