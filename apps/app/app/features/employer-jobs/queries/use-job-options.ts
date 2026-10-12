import { useQuery } from "@tanstack/react-query"

import { jobsQuery } from "./employer-jobs.queries"

/** The first page of jobs as select items, for pickers outside the jobs pages. */
export function useJobOptions() {
  return useQuery({
    ...jobsQuery({ page: 1, tab: "all" }),
    select: (page) =>
      page.results.map((job) => ({
        value: job.id,
        label: job.title ?? job.id,
      })),
  }).data
}
