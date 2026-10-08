import { useMutation, useQueryClient } from "@tanstack/react-query"
import { candidatesKeys } from "../queries/candidates.queries"
import type {
  CandidateDecision,
  CandidateProfile,
} from "../schemas/candidates.schema"
import { candidatesService } from "../services/candidates.service"

export function useCandidateDecision(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (decision: CandidateDecision) =>
      candidatesService.decide(id, decision),
    onSuccess: (_data, decision) =>
      queryClient.setQueryData<CandidateProfile>(
        candidatesKeys.profile(id),
        (profile) =>
          profile && {
            ...profile,
            is_approved: decision === "approve",
            is_rejected: decision === "reject",
          }
      ),
    meta: {
      successMessage: "Candidate updated",
      errorMessage: "Couldn't update the candidate",
      invalidates: [[...candidatesKeys.all, "list"], candidatesKeys.summary()],
    },
  })
}
