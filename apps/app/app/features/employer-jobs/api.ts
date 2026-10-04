import { xhrUpload } from "@workspace/api"
import { queryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

const text = z.string().nullish()
const id = z.union([z.string(), z.number()]).transform(String)
// numbers arrive as numbers, numeric strings or null
const num = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  })
const list = z
  .union([z.array(z.string()), z.string()])
  .nullish()
  .transform((value) =>
    Array.isArray(value)
      ? value
      : (value ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
  )

export const jobSchema = z.looseObject({
  id,
  title: text,
  status: text,
  job_status: text,
  job_posted_date: text,
  work_mode: text,
  employment_type: text,
  industry_type: text,
  location: text,
  city: text,
  state: text,
  country: text,
  salary_range: text,
  salary_min_lpa: num,
  salary_max_lpa: num,
  experience_required: text,
  experience_min_years: num,
  experience_max_years: num,
  number_of_openings: num,
  application_deadline: text,
  deadline: text,
  description: text,
  responsibilities: z
    .union([z.array(z.string()), z.string()])
    .nullish()
    .transform((value) =>
      Array.isArray(value)
        ? value
        : (value ?? "").split("\n").filter((line) => line.trim())
    ),
  skills_required: list,
  minimum_education: text,
  specialization: text,
  jd_file_url: text,
  ai_generated_jd: z.boolean().nullish(),
})
export type Job = z.infer<typeof jobSchema>

/** Ids go into request paths, so anything odd in a URL is a not-found. */
export const isJobId = (value: string | undefined): value is string =>
  /^[\w-]{1,64}$/.test(value ?? "")

export type JobStatus = "open" | "paused" | "closed" | "pending"

/** Unapproved jobs show as pending whatever their own status says. */
export const statusOf = (job: Job): JobStatus => {
  if (job.job_status && job.job_status.toLowerCase() !== "approved")
    return "pending"
  const status = (job.status ?? "open").toLowerCase()
  return status === "paused" || status === "closed" ? status : "open"
}

export const jobsPageSchema = z.looseObject({
  results: z.array(jobSchema).catch([]),
  count: z.number().nullish(),
  total_pages: z.number().nullish(),
})

const capitalised = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1)

export const JOB_TABS = ["all", "open", "paused", "closed", "pending"] as const
export type JobTab = (typeof JOB_TABS)[number]

export const jobsQuery = (params: { page: number; tab: JobTab }) =>
  queryOptions({
    queryKey: ["employer", "jobs", "list", params],
    queryFn: async () => {
      const search: Record<string, string> = { page: String(params.page) }
      // the API takes capitalised statuses; approval is its own field
      if (params.tab === "pending") search.approval_status = "pending"
      else if (params.tab !== "all") search.status = capitalised(params.tab)
      return jobsPageSchema.parse(
        dataOf(await api.get("user/v1/employer_jobs/", { query: search }))
      )
    },
    staleTime: 30_000,
  })

export const jobQuery = (jobId: string) =>
  queryOptions({
    queryKey: ["employer", "jobs", "detail", jobId],
    queryFn: async () =>
      jobSchema.parse(
        dataOf(await api.get(`user/v1/employer_job_detail/${jobId}/`))
      ),
    staleTime: 30_000,
  })

export const JOBS_KEY = ["employer", "jobs"] as const

export const setJobStatus = (jobId: string, status: JobStatus) =>
  api.patch(`user/v1/employer_job_detail/${jobId}/`, {
    status: capitalised(status),
  })

export const updateJob = (jobId: string, payload: Record<string, unknown>) =>
  api.patch(`user/v1/employer_job_detail/${jobId}/`, payload)

export const deleteJob = (jobId: string) =>
  api.delete(`user/v1/employer_job_detail/${jobId}/`)

export const createJob = async (form: FormData) =>
  z
    .looseObject({ id: id.nullish() })
    .catch({ id: null })
    .parse(dataOf(await xhrUpload(api, "user/v1/employer_jobs/", form)))

export const parsedJdSchema = z.looseObject({
  job_title: text,
  work_mode: text,
  employment_type: text,
  industry_type: text,
  required_skills: z.array(z.string()).nullish(),
  skills_text: text,
  salary_min_lpa: num,
  salary_max_lpa: num,
  experience_min: num,
  experience_max: num,
  country: text,
  state: text,
  city: text,
  location: text,
  minimum_education: text,
  specialization: text,
  responsibilities: z.union([z.array(z.string()), z.string()]).nullish(),
  job_description: text,
  number_of_openings: num,
  application_deadline: text,
})
export type ParsedJd = z.infer<typeof parsedJdSchema>

// AI parsing can take longer than the fetch timeout; uploads have none
export async function parseJd(file: File, title: string) {
  const form = new FormData()
  form.append("file", file)
  form.append("title", title)
  const body = dataOf(
    await xhrUpload(api, "user/v1/employer_job_jd_ai/parse/", form)
  ) as { parse_response?: { flat?: unknown }; parsed_fields?: unknown } | null
  return parsedJdSchema.parse(
    body?.parse_response?.flat ?? body?.parsed_fields ?? {}
  )
}
