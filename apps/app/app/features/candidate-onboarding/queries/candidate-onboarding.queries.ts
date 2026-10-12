import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

import {
  meSchema,
  reviewSchema,
  skillsSchema,
  statusSchema,
} from "../schemas/candidate-onboarding.schema"

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

/** The API reads the profile with a POST and no body. */
export const myProfileQuery = () =>
  queryOptions({
    queryKey: ["candidate", "me"],
    queryFn: async () =>
      meSchema.parse(dataOf(await api.post("user/v1/candidate_profile/"))),
    staleTime: 5 * 60_000,
  })
