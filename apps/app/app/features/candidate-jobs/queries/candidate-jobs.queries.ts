import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

import { jobsPageSchema } from "../schemas/candidate-jobs.schema"
import type { JobSearch, JobsPage, Stage } from "../types"

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
