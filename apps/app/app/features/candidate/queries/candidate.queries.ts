import { queryOptions } from "@tanstack/react-query"
import { HttpError } from "@workspace/api"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

import { newestFirst } from "../lib/scorecards"
import {
  ownProfileSchema,
  profileSchema,
  scorecardListSchema,
} from "../schemas/candidate.schema"
import { scorecardSchema } from "../schemas/scorecard.schema"

export const unlockedProfileQuery = (id: string) =>
  queryOptions({
    queryKey: ["employer", "unlocked", "profile", id],
    queryFn: async () =>
      profileSchema.parse(
        dataOf(await api.get(`user/v1/employer_unlock_candidate/${id}/`))
      ),
    staleTime: 5 * 60_000,
  })

export const unlockedScorecardQuery = (id: string) =>
  queryOptions({
    queryKey: ["employer", "unlocked", "scorecard", id],
    queryFn: async () =>
      scorecardSchema.parse(
        dataOf(
          await api.get(`user/v1/employer_unlock_candidate/${id}/scorecard/`)
        )
      ),
    staleTime: 5 * 60_000,
  })

export const ownScorecardQuery = (id: string) =>
  queryOptions({
    queryKey: ["candidate", "scorecard", id],
    queryFn: async () =>
      scorecardSchema.parse(
        dataOf(await api.get(`user/v1/candidate_scorecard/${id}/`))
      ),
    staleTime: 60_000,
  })

// no interviews yet comes back as a 404
export const ownScorecardsQuery = () =>
  queryOptions({
    queryKey: ["candidate", "scorecards"],
    queryFn: async () => {
      try {
        return newestFirst(
          scorecardListSchema.parse(
            dataOf(await api.get("user/v1/candidate_scorecard/"))
          )
        )
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) return []
        throw error
      }
    },
    staleTime: 60_000,
  })

const OWN_PROFILE = ["candidate", "profile"] as const

// the API reads the profile with a POST and no body
export const ownProfileQuery = () =>
  queryOptions({
    queryKey: OWN_PROFILE,
    queryFn: async () =>
      ownProfileSchema.parse(
        dataOf(await api.post("user/v1/candidate_profile/"))
      ),
    staleTime: 60_000,
  })
