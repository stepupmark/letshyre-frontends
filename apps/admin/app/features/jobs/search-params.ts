import { compactParams, oneOf, pageOf, textOf } from "@/lib/search-params"

import {
  APPROVAL_STATUSES,
  JOB_STATUSES,
  type JobsFilters,
} from "./schemas/jobs.schema"

export function readJobsParams(params: URLSearchParams) {
  return {
    page: pageOf(params),
    q: textOf(params, "q"),
    status: oneOf(params.get("status"), JOB_STATUSES),
    approval: oneOf(params.get("approval"), APPROVAL_STATUSES),
    from: textOf(params, "from"),
    to: textOf(params, "to"),
  }
}

export function toJobsFilters(
  params: ReturnType<typeof readJobsParams>
): JobsFilters {
  return {
    page: params.page,
    ...compactParams({
      search: params.q.trim(),
      // the API expects "Open", "Paused", "Closed"
      status: params.status
        ? params.status.charAt(0).toUpperCase() + params.status.slice(1)
        : null,
      is_pending: params.approval === "pending" || null,
      is_approved: params.approval === "approved" || null,
      is_rejected: params.approval === "rejected" || null,
      from_date: params.from,
      end_date: params.to,
    }),
  }
}
