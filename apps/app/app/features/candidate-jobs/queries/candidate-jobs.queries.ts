import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

import { APPLICATIONS_PAGE } from "../lib/applications"
import { toApiQuery } from "../lib/search"
import { jobsPageSchema } from "../schemas/candidate-jobs.schema"
import type { JobSearch, JobsPage, Stage } from "../types"

export const candidateJobsKeys = {
  find: ["candidate", "find-jobs"] as const,
  applications: ["candidate", "applications"] as const,
}

export const findJobsQuery = (search: JobSearch) =>
  queryOptions({
    queryKey: [...candidateJobsKeys.find, search],
    queryFn: async (): Promise<JobsPage> => {
      const data = jobsPageSchema.parse(
        dataOf(
          await api.get("user/v1/candidate_find_jobs/", {
            query: toApiQuery(search),
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

const applicationsPage = async (stage: Stage, page: number, limit: number) =>
  jobsPageSchema.parse(
    dataOf(
      await api.get("user/v1/candidate_jobs/", {
        query: { application_status: stage, page, limit },
      })
    )
  )

export const applicationsQuery = (stage: Stage, page: number) =>
  queryOptions({
    queryKey: [...candidateJobsKeys.applications, stage, page],
    queryFn: async (): Promise<JobsPage> => {
      const data = await applicationsPage(stage, page, APPLICATIONS_PAGE)
      const total = data.count ?? data.results.length
      return {
        jobs: data.results,
        total,
        pages: Math.max(1, Math.ceil(total / APPLICATIONS_PAGE)),
      }
    },
    // keep the last page on screen while paging, but not across stages
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[2] === stage ? previous : undefined,
    staleTime: 30_000,
  })

export const applicationCountQuery = (stage: Stage) =>
  queryOptions({
    queryKey: [...candidateJobsKeys.applications, "count", stage],
    queryFn: async () => {
      const data = await applicationsPage(stage, 1, 1)
      return data.count ?? data.results.length
    },
    staleTime: 30_000,
  })
