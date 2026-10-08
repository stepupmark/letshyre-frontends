import { z } from "zod"
import { envelope, id, paginated } from "~/lib/api/schemas"

const text = z.string().nullish()
const yearOrNumber = z.union([z.string(), z.number()]).nullish()
const list = <T extends z.ZodType>(item: T) =>
  z
    .array(item)
    .nullish()
    .transform((value) => value ?? [])
const count = z
  .number()
  .nullish()
  .transform((value) => value ?? 0)

export const GENDERS = ["Male", "Female", "Other"] as const
export const INDUSTRIES = [
  "IT / Software Development",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Marketing",
  "Design & Creative",
  "Logistics & Supply Chain",
] as const

const candidateSchema = z.object({
  id,
  name: text,
  email: text,
  phone_number: text,
  is_verified: z.boolean().nullish(),
  is_profile_complete: z.boolean().nullish(),
  profile_completion_score: count,
  location: text,
  preferred_industry: text,
  gender: text,
  created_at: z.string(),
})

const candidateProfileSchema = z.object({
  id,
  name: text,
  email: text,
  phone_number: text,
  profile_photo: text,
  dob: text,
  gender: text,
  location: text,
  address: text,
  role: text,
  aadhar_number: text,
  education: list(
    z.object({
      institution: text,
      degree: text,
      level: text,
      field: text,
      stream: text,
      start_year: yearOrNumber,
      end_year: yearOrNumber,
      percentage: yearOrNumber,
    })
  ),
  experience: list(
    z.object({
      company: text,
      role: text,
      start_date: text,
      end_date: text,
      description: text,
    })
  ),
  projects: list(
    z.object({
      title: text,
      description: text,
      live_url: text,
      github_url: text,
      tech_stack: list(z.string()),
    })
  ),
  skills: list(z.string()),
  preferred_locations: list(z.string()),
  preferred_industry: text,
  current_ctc: yearOrNumber,
  expected_ctc: yearOrNumber,
  notice_period: text,
  notice_period_prof_type: text,
  notice_period_prof: text,
  present_or_last_working_company: text,
  last_day_of_working: text,
  resume_url: text,
  resignation_letter: text,
  experience_letter: text,
  present_offer: text,
  cover_letter: text,
  is_verified: z.boolean().nullish(),
  profile_completion_score: count,
  is_approved: z.boolean().nullish(),
  is_rejected: z.boolean().nullish(),
  created_at: text,
  updated_at: text,
})

const candidateSummarySchema = z.object({
  total_candidates: count,
  today_registrations: count,
  completed_profiles: count,
  in_completed_profiles: count,
  verified_candidates: count,
})

export const candidatesResponseSchema = envelope(paginated(candidateSchema))
export const candidateProfileResponseSchema = envelope(candidateProfileSchema)
export const candidateSummaryResponseSchema = envelope(candidateSummarySchema)

export type Candidate = z.infer<typeof candidateSchema>
export type CandidateProfile = z.infer<typeof candidateProfileSchema>
export type CandidateFilters = {
  page: number
  search?: string
  gender?: string
  preferred_industry?: string
  is_verified?: boolean
  is_profile_complete?: boolean
}
export type CandidateDecision = "approve" | "reject"
