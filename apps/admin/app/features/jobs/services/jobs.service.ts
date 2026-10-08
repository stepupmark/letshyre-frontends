import { api } from "@/lib/api"
import {
  jobDetailResponseSchema,
  jobsResponseSchema,
  jobsSummaryResponseSchema,
  type JobsAction,
  type JobsFilters,
} from "../schemas/jobs.schema"

export const jobsService = {
  async list(filters: JobsFilters, signal?: AbortSignal) {
    const data = await api.get("user/v1/admin/jobs/", {
      query: { ...filters },
      signal,
    })
    return jobsResponseSchema.parse(data).data
  },

  async detail(id: string, signal?: AbortSignal) {
    const data = await api.get(
      `user/v1/admin/job-detail/${encodeURIComponent(id)}`,
      { signal }
    )
    return jobDetailResponseSchema.parse(data).data
  },

  async summary(signal?: AbortSignal) {
    const data = await api.get("user/v1/admin/jobs/dashboard/cards/", {
      signal,
    })
    return jobsSummaryResponseSchema.parse(data).data
  },

  async act(payload: JobsAction) {
    await api.post("user/v1/admin/bulk_approvals/job/", payload)
  },
}
