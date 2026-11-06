import { useMutation, useQueryClient } from "@tanstack/react-query"

import { creditsQuery } from "@/lib/credits"

import { unlockProblem } from "../lib/unlock-error"
import {
  interviewsQuery,
  UNLOCKED_KEY,
} from "../queries/candidate-unlock.queries"
import { unlockCandidate } from "../services/candidate-unlock.service"

/** Spends credits, then refreshes the balance and the interviews it unlocked. */
export function useUnlock(
  candidateId: string,
  { onUnlocked }: { onUnlocked: (creditsLeft: number | undefined) => unknown }
) {
  const queryClient = useQueryClient()
  const credits = creditsQuery().queryKey
  const interviews = interviewsQuery(candidateId).queryKey
  return useMutation({
    mutationFn: (ids: (string | number)[]) => unlockCandidate(candidateId, ids),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: credits }),
        queryClient.invalidateQueries({ queryKey: interviews }),
        queryClient.invalidateQueries({ queryKey: UNLOCKED_KEY }),
      ])
      await onUnlocked(queryClient.getQueryData(credits)?.available_credits)
    },
    onError: (error) => {
      void queryClient.invalidateQueries({ queryKey: credits })
      if (unlockProblem(error) === "alreadyUnlocked")
        void queryClient.invalidateQueries({ queryKey: interviews })
    },
  })
}
