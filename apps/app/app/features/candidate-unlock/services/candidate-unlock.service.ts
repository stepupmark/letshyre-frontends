import { api } from "@/lib/api"

export const unlockCandidate = (
  candidateId: string,
  interviews: (string | number)[]
) =>
  api.post("user/v1/employer_unlock_candidate/", {
    candidate: /^\d+$/.test(candidateId) ? Number(candidateId) : candidateId,
    interview: interviews,
  })
