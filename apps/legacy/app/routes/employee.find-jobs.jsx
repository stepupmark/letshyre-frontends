import { queryClient } from "@/lib/queryClient";
import { findJobsQuery, INITIAL_FIND_JOBS_FILTERS } from "@/features/employee/hooks/useFindJobs";
import { authedPrefetch } from "@/loaders/prefetch";

export { FindJobs as default } from "@/features/employee/FindJobs";

export const clientLoader = authedPrefetch(async () => {
  queryClient.prefetchQuery(findJobsQuery(INITIAL_FIND_JOBS_FILTERS));
  return null;
});
