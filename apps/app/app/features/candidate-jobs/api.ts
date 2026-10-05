import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

const text = z.string().nullish()

const skills = z.preprocess(
  (value) =>
    typeof value === "string"
      ? value
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : value,
  z.array(z.string()).catch([]).nullish()
)

const jobSchema = z.looseObject({
  id: z.union([z.string(), z.number()]).transform(String),
  title: text,
  company_name: text,
  company_logo: text,
  employer: z
    .union([
      z.string(),
      z.looseObject({
        company_name: text,
        company_logo: text,
        kyc: z.looseObject({ company_logo: text }).nullish(),
      }),
    ])
    .nullish(),
  location: text,
  employment_type: text,
  industry_type: text,
  experience_required: z.union([z.string(), z.number()]).nullish(),
  salary_range: text,
  skills_required: skills,
  description: text,
  created_at: text,
  // set once the candidate has applied
  status: text,
})
export type Job = z.infer<typeof jobSchema>

export const companyOf = (job: Job) =>
  (typeof job.employer === "string"
    ? job.employer
    : job.employer?.company_name) ??
  job.company_name ??
  null

export const logoOf = (job: Job) =>
  (typeof job.employer === "object"
    ? (job.employer?.kyc?.company_logo ?? job.employer?.company_logo)
    : null) ??
  job.company_logo ??
  null

const page = z.looseObject({
  results: z.array(jobSchema).catch([]),
  count: z.number().nullish(),
  total_pages: z.number().nullish(),
  next: z.string().nullish(),
})

export const jobsPageSchema = z.preprocess(
  (value) => (Array.isArray(value) ? { results: value } : value),
  page
)

export interface JobSearch {
  q: string
  location: string
  type: string
  industry: string
  experience: string
  salary: string
  page: number
}

export interface JobsPage {
  jobs: Job[]
  total: number
  pages: number
}

export const findJobsQuery = (search: JobSearch) =>
  queryOptions({
    queryKey: ["candidate", "find-jobs", search],
    queryFn: async (): Promise<JobsPage> => {
      const data = jobsPageSchema.parse(
        dataOf(
          await api.get("user/v1/candidate_find_jobs/", {
            query: {
              job_search: search.q || undefined,
              location: search.location || undefined,
              employment_type: search.type || undefined,
              industry_type: search.industry || undefined,
              experience_required: search.experience || undefined,
              salary_range: search.salary || undefined,
              page: search.page,
            },
          })
        )
      )
      return {
        jobs: data.results,
        total: data.count ?? data.results.length,
        pages: Math.max(1, data.total_pages ?? 1),
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })

export const STAGES = [
  "Applied",
  "Shortlisted",
  "Selected",
  "Rejected",
] as const
export type Stage = (typeof STAGES)[number]

const APPLICATIONS_PAGE = 10

export const applicationsQuery = (stage: Stage, pageNumber: number) =>
  queryOptions({
    queryKey: ["candidate", "applications", stage, pageNumber],
    queryFn: async () => {
      const data = jobsPageSchema.parse(
        dataOf(
          await api.get("user/v1/candidate_jobs/", {
            query: {
              application_status: stage,
              page: pageNumber,
              limit: APPLICATIONS_PAGE,
            },
          })
        )
      )
      return {
        jobs: data.results,
        total: data.count ?? data.results.length,
        hasNext: Boolean(data.next),
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

export const applyForJob = (jobId: string) =>
  api.post("user/v1/candidate_jobs/", { job: jobId })
