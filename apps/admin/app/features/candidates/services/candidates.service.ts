import { http } from "~/lib/api/http-client"
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
    const { data } = await http.get("user/v1/admin/candidates/", {
      params: filters,
      signal,
    })
    return candidatesResponseSchema.parse(data).data
  },

  async profile(id: string, signal?: AbortSignal) {
    const { data } = await http.get(profileUrl(id), { signal })
    return candidateProfileResponseSchema.parse(data).data
  },

  async summary(signal?: AbortSignal) {
    const { data } = await http.get(
      "user/v1/admin/candidate/dashboard/cards/",
      { signal }
    )
    return candidateSummaryResponseSchema.parse(data).data
  },

  async decide(id: string, decision: CandidateDecision) {
    await http.put(
      profileUrl(id),
      decision === "approve" ? { is_approved: true } : { is_rejected: true }
    )
  },
}
