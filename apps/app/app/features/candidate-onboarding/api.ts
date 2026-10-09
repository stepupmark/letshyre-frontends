import { xhrUpload } from "@workspace/api"
import { queryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

import type { Values } from "./schema"

const text = z
  .string()
  .nullish()
  .transform((v) => v ?? "")

const reviewSchema = z.looseObject({
  skills: z.array(z.string()).catch([]),
  certifications: z.array(z.unknown()).catch([]),
  education: z
    .array(z.looseObject({ institution: text, degree: text, duration: text }))
    .catch([]),
  experience: z
    .array(
      z.looseObject({
        role: text,
        company: text,
        duration: text,
        description: text,
      })
    )
    .catch([]),
  projects: z
    .array(z.looseObject({ title: text, description: text }))
    .catch([]),
})
export type Review = z.infer<typeof reviewSchema>

export async function uploadResume(
  file: File,
  onProgress: (fraction: number) => void
) {
  const form = new FormData()
  form.append("resume", file)
  const body = dataOf(
    await xhrUpload(api, "user/v1/candidate_resume_ai/upload/", form, {
      onProgress,
    })
  )
  const id = z
    .looseObject({ job_id: z.union([z.string(), z.number()]) })
    .parse(body).job_id
  return String(id)
}

const statusSchema = z.looseObject({
  status: z.string(),
  ai_resume_id: z.union([z.string(), z.number()]).nullish(),
  error_message: z.string().nullish(),
  suggested_roles: z
    .looseObject({
      suggested_roles: z.array(z.string()).nullish(),
      roles: z.array(z.string()).nullish(),
    })
    .nullish(),
})

export const resumeStatusQuery = (jobId: string) =>
  queryOptions({
    queryKey: ["candidate", "resume-ai", jobId],
    queryFn: async () => {
      const status = statusSchema.parse(
        dataOf(await api.get(`user/v1/candidate_resume_ai/status/${jobId}/`))
      )
      const roles =
        status.suggested_roles?.suggested_roles ??
        status.suggested_roles?.roles ??
        []
      return {
        state: status.status.toLowerCase(),
        resumeId:
          status.ai_resume_id == null ? "" : String(status.ai_resume_id),
        error: status.error_message ?? null,
        roles: [...new Set(roles.map((r) => r.trim()).filter(Boolean))],
      }
    },
    // polled until done or failed; stops on unmount with the query
    refetchInterval: (query) =>
      ["completed", "failed"].includes(query.state.data?.state ?? "")
        ? false
        : 2000,
    retry: 2,
  })

export const reviewQuery = (jobId: string) =>
  queryOptions({
    queryKey: ["candidate", "resume-review", jobId],
    queryFn: async () => {
      const body = dataOf(
        await api.get(`user/v1/candidate_resume_ai/review_data/${jobId}/`)
      )
      return reviewSchema.parse(dataOf(body) ?? {})
    },
    staleTime: Infinity,
  })

const skillsSchema = z.looseObject({
  needs_clarification: z.boolean().nullish(),
  suggestions: z.array(z.string()).nullish(),
  skills: z.array(z.string()).nullish(),
})

export const skillsQuery = (role: string) =>
  queryOptions({
    queryKey: ["candidate", "skills-for-role", role.toLowerCase()],
    queryFn: async () => {
      const body = skillsSchema.parse(
        dataOf(
          await api.post("user/v1/candidate_resume_ai/skills_for_role/", {
            role,
          })
        )
      )
      return body.needs_clarification
        ? { kind: "clarify" as const, roles: body.suggestions ?? [] }
        : { kind: "skills" as const, skills: body.skills ?? [] }
    },
    staleTime: Infinity,
  })

export interface Documents {
  profile_photo: File | null
  resignation_letter: File | null
  experience_letter: File | null
  present_offer: File | null
  notice_period_proof: File | null
  resume: File | null
}

export interface Resume {
  resumeId: string
  role: string
  otherReason: string
  review: Review
}

/** "2 years 6 months" → 2.5, summed across every job. */
const yearsOf = (experience: Review["experience"]) =>
  experience.reduce((sum, job) => {
    const years = /(\d+)\s*year/i.exec(job.duration)?.[1]
    const months = /(\d+)\s*month/i.exec(job.duration)?.[1]
    return sum + Number(years ?? 0) + Number(months ?? 0) / 12
  }, 0)

/** The multipart body the API expects; it spells "prof" its own way. */
export function profileForm(values: Values, files: Documents, resume: Resume) {
  const form = new FormData()
  const put = (key: string, value: string | Blob | null) => {
    if (value !== null) form.append(key, value)
  }
  put("gender", values.gender)
  put("dob", values.dob)
  put("aadhar_number", values.aadhar_number.replace(/\D/g, ""))
  put("location", values.location)
  put("address", values.address)
  put("profile_photo", files.profile_photo)
  put("present_or_last_working_company", values.present_or_last_working_company)
  put("last_day_of_working", values.last_day_of_working)
  put("current_ctc", values.current_ctc)
  put("expected_ctc", values.expected_ctc)
  put("preferred_industry", values.preferred_industry)
  put("preferred_locations", JSON.stringify(values.preferred_locations))
  put("resignation_letter", files.resignation_letter)
  put("experience_letter", files.experience_letter)
  put("present_offer", files.present_offer)
  put("notice_period_prof_type", values.notice_period_proof_type)
  put("notice_period_prof", files.notice_period_proof)
  put("resume", files.resume)
  put("resume_id", resume.resumeId)
  put("role", resume.role)
  put("selected_role", resume.role)
  put("role_other_reason", resume.otherReason)
  const { review } = resume
  put("parsed_resume_data", JSON.stringify(review))
  put("education", JSON.stringify(review.education))
  put("experience", JSON.stringify(review.experience))
  put("projects", JSON.stringify(review.projects))
  put("certifications", JSON.stringify(review.certifications))
  put("total_experience_years", yearsOf(review.experience).toFixed(1))
  const byRole: Record<string, number> = {}
  for (const job of review.experience)
    if (job.role) byRole[job.role] = (byRole[job.role] ?? 0) + 1
  put("tech_experience", JSON.stringify(byRole))
  put("profile_completion_score", "100")
  put("is_profile_complete", "true")
  return form
}

export const submitProfile = (
  form: FormData,
  onProgress: (fraction: number) => void
) => xhrUpload(api, "user/v1/candidate_profile/", form, { onProgress })

const meSchema = z.looseObject({
  is_profile_complete: z.boolean().nullish(),
})

/** The API reads the profile with a POST and no body. */
export const myProfileQuery = () =>
  queryOptions({
    queryKey: ["candidate", "me"],
    queryFn: async () =>
      meSchema.parse(dataOf(await api.post("user/v1/candidate_profile/"))),
    staleTime: 5 * 60_000,
  })
