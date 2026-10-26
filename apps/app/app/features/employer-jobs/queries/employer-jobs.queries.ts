import { payloadOf } from "@workspace/api"
import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"

import { capitalised } from "../lib/employer-jobs"
import { jobSchema, jobsPageSchema } from "../schemas/employer-jobs.schema"
import type { JobTab } from "../types"

export const jobsQuery = (params: { page: number; tab: JobTab }) =>
  queryOptions({
    queryKey: ["employer", "jobs", "list", params],
    queryFn: async () => {
      const search: Record<string, string> = { page: String(params.page) }
      // the API takes capitalised statuses; approval is its own field
      if (params.tab === "pending") search.approval_status = "pending"
      else if (params.tab !== "all") search.status = capitalised(params.tab)
      return jobsPageSchema.parse(
        payloadOf(await api.get("user/v1/employer_jobs/", { query: search }))
      )
    },
    staleTime: 30_000,
  })

export const jobQuery = (jobId: string) =>
  queryOptions({
    queryKey: ["employer", "jobs", "detail", jobId],
    queryFn: async () =>
      jobSchema.parse(
        payloadOf(await api.get(`user/v1/employer_job_detail/${jobId}/`))
      ),
    staleTime: 30_000,
  })

export const JOBS_KEY = ["employer", "jobs"] as const
