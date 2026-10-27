import { payloadOf } from "@workspace/api"
import { queryOptions } from "@tanstack/react-query"

import {
  interviewsSchema,
  unlockedPageSchema,
} from "../schemas/candidate-unlock.schema"
import {
  getInterviews,
  getUnlocked,
} from "../services/candidate-unlock.service"
import type { UnlockedParams } from "../types"

export const UNLOCKED_KEY = ["employer", "unlocked"] as const

export const interviewsQuery = (candidateId: string) =>
  queryOptions({
    queryKey: ["employer", "candidate-interviews", candidateId],
    queryFn: async () =>
      interviewsSchema.parse(payloadOf(await getInterviews(candidateId)) ?? []),
  })

export const unlockedQuery = (params: UnlockedParams) =>
  queryOptions({
    queryKey: [...UNLOCKED_KEY, params],
    queryFn: async () => unlockedPageSchema.parse(await getUnlocked(params)),
    staleTime: 30_000,
  })
