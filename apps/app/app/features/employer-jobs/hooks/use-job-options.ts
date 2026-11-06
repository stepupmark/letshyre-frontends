import { useQuery } from "@tanstack/react-query"

import { allJobsQuery } from "../queries/employer-jobs.queries"

/** Every job as select items, for pickers outside the jobs pages. */
export function useJobOptions() {
  return useQuery({
    ...allJobsQuery(),
    select: (jobs) =>
      jobs.map((job) => ({ value: job.id, label: job.title ?? job.id })),
  }).data
}
