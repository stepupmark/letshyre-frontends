import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

import {
  interviewsSchema,
  unlockedPageSchema,
} from "../schemas/candidate-unlock.schema"

export const interviewsQuery = (candidateId: string) =>
  queryOptions({
    queryKey: ["employer", "candidate-interviews", candidateId],
    queryFn: async () =>
      interviewsSchema.parse(
        dataOf(
          await api.get(`user/v1/employer_candidate_interviews/${candidateId}/`)
        ) ?? []
      ),
  })

export const unlockedQuery = (page: number) =>
  queryOptions({
    queryKey: ["employer", "unlocked", page],
    queryFn: async () =>
      unlockedPageSchema.parse(
        await api.get("user/v1/employer_unlock_candidate/", { query: { page } })
      ),
    staleTime: 30_000,
  })

export const UNLOCKED_KEY = ["employer", "unlocked"] as const
