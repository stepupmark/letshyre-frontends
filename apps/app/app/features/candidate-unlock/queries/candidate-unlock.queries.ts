import { payloadOf } from "@workspace/api"
import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"

import {
  interviewsSchema,
  unlockedPageSchema,
} from "../schemas/candidate-unlock.schema"

export const UNLOCKED_KEY = ["employer", "unlocked"] as const

export const interviewsQuery = (candidateId: string) =>
  queryOptions({
    queryKey: ["employer", "candidate-interviews", candidateId],
    queryFn: async () =>
      interviewsSchema.parse(
        payloadOf(
          await api.get(`user/v1/employer_candidate_interviews/${candidateId}/`)
        ) ?? []
      ),
  })

export const unlockedQuery = (page: number) =>
  queryOptions({
    queryKey: [...UNLOCKED_KEY, page],
    queryFn: async () =>
      unlockedPageSchema.parse(
        await api.get("user/v1/employer_unlock_candidate/", { query: { page } })
      ),
    staleTime: 30_000,
  })
