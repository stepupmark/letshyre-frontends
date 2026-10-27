import { api } from "@/lib/api"

import type { UnlockedParams } from "../types"

export const unlockCandidate = (
  candidateId: string,
  interviews: (string | number)[]
) =>
  api.post("user/v1/employer_unlock_candidate/", {
    candidate: /^\d+$/.test(candidateId) ? Number(candidateId) : candidateId,
    interview: interviews,
  })

export const getInterviews = (candidateId: string) =>
  api.get(`user/v1/employer_candidate_interviews/${candidateId}/`)

export const getUnlocked = ({ page, limit, filters }: UnlockedParams) =>
  api.get("user/v1/employer_unlock_candidate/", {
    query: {
      page,
      limit,
      skills: filters.skills.join(",") || undefined,
      experience_min: filters.min ?? undefined,
      experience_max: filters.max ?? undefined,
    },
  })
