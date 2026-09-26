import { http } from "~/lib/api/http-client";
import {
  jobDetailResponseSchema,
  jobsResponseSchema,
  jobsSummaryResponseSchema,
  type JobsAction,
  type JobsFilters,
} from "../schemas/jobs.schema";

export const jobsService = {
  async list(filters: JobsFilters, signal?: AbortSignal) {
    const { data } = await http.get("user/v1/admin/jobs/", {
      params: filters,
      signal,
    });
    return jobsResponseSchema.parse(data).data;
  },

  async detail(id: string, signal?: AbortSignal) {
    const { data } = await http.get(
      `user/v1/admin/job-detail/${encodeURIComponent(id)}`,
      { signal },
    );
    return jobDetailResponseSchema.parse(data).data;
  },

  async summary(signal?: AbortSignal) {
    const { data } = await http.get("user/v1/admin/jobs/dashboard/cards/", {
      signal,
    });
    return jobsSummaryResponseSchema.parse(data).data;
  },

  async act(payload: JobsAction) {
    await http.post("user/v1/admin/bulk_approvals/job/", payload);
  },
};
