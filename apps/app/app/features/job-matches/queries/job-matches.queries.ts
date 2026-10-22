import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

import { matchScore } from "../lib/job-matches"
import { matchesSchema } from "../schemas/job-matches.schema"

// best match first; the API doesn't promise an order
export const matchesQuery = (jobId: string, appliedOnly: boolean) =>
  queryOptions({
    queryKey: ["employer", "matches", jobId, { appliedOnly }],
    queryFn: async () => {
      const data = matchesSchema.parse(
        dataOf(
          await api.get(`user/v1/employer_job_ai/matching/${jobId}/`, {
            query: { applied_only: appliedOnly, engine: "v2" },
          })
        )
      )
      return {
        ...data,
        matches: [...data.matches].sort(
          (a, b) => matchScore(b) - matchScore(a)
        ),
      }
    },
    staleTime: 60_000,
  })
