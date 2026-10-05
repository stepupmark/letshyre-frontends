import { HttpError } from "@workspace/api"
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

const listItem = z.looseObject({
  id: z.union([z.string(), z.number()]).transform(String),
  overall_score: num,
  created_at: text,
  candidate_skills: list(z.string()),
  category_scores: z.looseObject({ candidate_role: text }).nullish(),
})
export type ScorecardItem = z.infer<typeof listItem>

export const scorecardListSchema = z.preprocess(
  (value) =>
    Array.isArray(value)
      ? value
      : ((value as { results?: unknown } | null)?.results ?? []),
  z.array(listItem)
)

/** Newest first. No interviews yet comes back as a 404. */
export const ownScorecardsQuery = () =>
  queryOptions({
    queryKey: ["candidate", "scorecards"],
    queryFn: async () => {
      try {
        const items = scorecardListSchema.parse(
          dataOf(await api.get("user/v1/candidate_scorecard/"))
        )
        return items.toSorted((a, b) =>
          (b.created_at ?? "").localeCompare(a.created_at ?? "")
        )
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) return []
        throw error
      }
    },
    staleTime: 60_000,
  })

export const ownProfileSchema = z.looseObject({
  name: text,
  email: text,
  phone_number: z.union([z.string(), z.number()]).nullish(),
  profile_photo: text,
  is_verified: z.boolean().nullish(),
  role: text,
  location: text,
  address: z.unknown(),
  total_experience_years: num,
  present_or_last_working_company: text,
  last_day_of_working: text,
  current_ctc: num,
  expected_ctc: num,
  preferred_industry: text,
  preferred_locations: list(z.string()),
  skills: list(named),
  education: profileSchema.shape.candidate_education,
  experience: profileSchema.shape.candidate_experience,
  projects: profileSchema.shape.candidate_projects,
  certifications: list(named),
  resume: text,
  experience_letter: text,
  resignation_letter: text,
  notice_period_prof: text,
  present_offer: text,
  profile_completion_score: num,
  interview_attempts_used: num,
  max_interviews_allowed: num,
})
export type OwnProfile = z.infer<typeof ownProfileSchema>

const OWN_PROFILE = ["candidate", "profile"] as const

/** The API reads the profile with a POST and no body. */
export const ownProfileQuery = () =>
  queryOptions({
    queryKey: OWN_PROFILE,
    queryFn: async () =>
      ownProfileSchema.parse(
        dataOf(await api.post("user/v1/candidate_profile/"))
      ),
    staleTime: 60_000,
  })

/** Same endpoint with a body saves; only the fields sent change. */
export async function saveOwnProfile(fields: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.append(key, value)
  await api.post("user/v1/candidate_profile/", form)
}
