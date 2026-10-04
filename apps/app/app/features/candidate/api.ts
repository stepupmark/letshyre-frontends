import { queryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

import { scorecardSchema } from "./scorecard-schema"

export const isRecordId = (value: string | null | undefined): value is string =>
  /^[\w-]{1,64}$/.test(value ?? "")

const text = z.string().nullish()
const num = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  })

// older profiles store their lists as JSON strings
const list = <T extends z.ZodType>(item: T) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value
    try {
      return JSON.parse(value) as unknown
    } catch {
      return []
    }
  }, z.array(item).catch([]).nullish())

const named = z.union([
  z.string(),
  z.looseObject({ name: text, title: text, issuer: text }),
])

export const profileSchema = z.looseObject({
  id: z.union([z.string(), z.number()]).transform(String),
  candidate: z.union([z.string(), z.number()]).nullish(),
  candidate_name: text,
  candidate_email: text,
  candidate_phone: z.union([z.string(), z.number()]).nullish(),
  candidate_location: text,
  candidate_address: z.unknown(),
  candidate_profile_photo: text,
  candidate_is_verified: z.boolean().nullish(),
  candidate_total_experience_years: num,
  candidate_current_ctc: num,
  candidate_expected_ctc: num,
  candidate_notice_period: z.union([z.number(), z.string()]).nullish(),
  candidate_notice_period_prof: text,
  candidate_preferred_industry: text,
  candidate_preferred_locations: list(z.string()),
  candidate_skills: list(named),
  candidate_education: list(
    z.looseObject({ institution: text, degree: text, duration: text })
  ),
  candidate_experience: list(
    z.looseObject({
      role: text,
      company: text,
      duration: text,
      description: text,
    })
  ),
  candidate_projects: list(
    z.looseObject({ title: text, name: text, description: text })
  ),
  candidate_certifications: list(named),
  candidate_roles_applied: list(
    z.looseObject({ job_title: text, status: text })
  ),
  candidate_resume: text,
})
export type Profile = z.infer<typeof profileSchema>

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
