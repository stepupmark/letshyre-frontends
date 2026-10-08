import { createLoader, parseAsStringLiteral } from "nuqs"
import { compactParams, pageParser, textParser } from "~/lib/search-params"
import {
  APPROVAL_STATUSES,
  JOB_STATUSES,
  type JobsFilters,
} from "./schemas/jobs.schema"

export const jobsSearchParams = {
  page: pageParser,
  q: textParser,
  status: parseAsStringLiteral(JOB_STATUSES),
  approval: parseAsStringLiteral(APPROVAL_STATUSES),
  from: textParser,
  to: textParser,
}

export const loadJobsSearchParams = createLoader(jobsSearchParams)

type Params = {
  page: number
  q: string
  status: string | null
  approval: string | null
  from: string
  to: string
}

export function toJobsFilters(params: Params): JobsFilters {
  return {
    page: params.page,
    ...compactParams({
      search: params.q.trim(),
      // the API expects "Open", "Paused", "Closed"
      status: params.status
        ? params.status[0].toUpperCase() + params.status.slice(1)
        : null,
      is_pending: params.approval === "pending" || null,
      is_approved: params.approval === "approved" || null,
      is_rejected: params.approval === "rejected" || null,
      from_date: params.from,
      end_date: params.to,
    }),
  }
}
