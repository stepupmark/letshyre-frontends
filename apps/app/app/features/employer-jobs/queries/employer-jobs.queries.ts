import { payloadOf } from "@workspace/api"
import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"

import { capitalised } from "../lib/employer-jobs"
import { jobSchema, jobsPageSchema } from "../schemas/employer-jobs.schema"
import type { JobTab } from "../types"

interface PageParams {
  page: number
  tab: JobTab
}

async function fetchJobsPage(params: PageParams) {
  const search: Record<string, string> = { page: String(params.page) }
  if (params.tab !== "all") search.status = capitalised(params.tab)
  return jobsPageSchema.parse(
    payloadOf(await api.get("user/v1/employer_jobs/", { query: search }))
  )
}

export const jobsQuery = (params: PageParams) =>
  queryOptions({
    queryKey: ["employer", "jobs", "list", params],
    queryFn: () => fetchJobsPage(params),
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

// a safety stop in case total_pages is ever wrong
const MAX_PAGES = 20

/** Every job, for pickers that must offer older jobs too. */
export const allJobsQuery = () =>
  queryOptions({
    queryKey: [...JOBS_KEY, "all"],
    queryFn: async () => {
      const first = await fetchJobsPage({ page: 1, tab: "all" })
      const pages = Math.min(first.total_pages ?? 1, MAX_PAGES)
      const rest = await Promise.all(
        Array.from({ length: pages - 1 }, (_, i) =>
          fetchJobsPage({ page: i + 2, tab: "all" })
        )
      )
      return [first, ...rest].flatMap((page) => page.results)
    },
    staleTime: 30_000,
  })
