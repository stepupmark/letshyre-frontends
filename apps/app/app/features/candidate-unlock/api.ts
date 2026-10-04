import { queryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

const text = z.string().nullish()
const num = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  })
// sent back as they came, so the API sees its own id type
const rawId = z.union([z.string(), z.number()])

export const interviewsSchema = z.array(
  z.looseObject({
    interview_id: rawId,
    role: text,
    score: num,
    unlocked: z.boolean().nullish(),
  })
)
export type Interview = z.infer<typeof interviewsSchema>[number]

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

export const unlockCandidate = (
  candidateId: string,
  interviews: (string | number)[]
) =>
  api.post("user/v1/employer_unlock_candidate/", {
    candidate: /^\d+$/.test(candidateId) ? Number(candidateId) : candidateId,
    interview: interviews,
  })

const unlockedSchema = z.looseObject({
  id: z.union([z.string(), z.number()]).transform(String),
  candidate_name: text,
  candidate_profile_photo: text,
  candidate_is_verified: z.boolean().nullish(),
  candidate_tech_experience: z.record(z.string(), z.unknown()).nullish(),
  candidate_experience: z.array(z.looseObject({ role: text })).nullish(),
  candidate_total_experience_years: num,
  candidate_location: text,
  candidate_current_ctc: num,
  candidate_expected_ctc: num,
  candidate_notice_period: num,
  unlocked_date: text,
  ai_overall_score: num,
})
export type Unlocked = z.infer<typeof unlockedSchema>

// paginated, or a bare list from older deployments
export const unlockedPageSchema = z.preprocess(
  (json) => {
    const data = dataOf(json)
    return Array.isArray(data)
      ? { results: data, count: data.length, total_pages: 1 }
      : data
  },
  z.looseObject({
    results: z.array(unlockedSchema).catch([]),
    count: z.number().nullish(),
    total_pages: z.number().nullish(),
  })
)

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
