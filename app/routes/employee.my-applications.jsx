import { queryClient } from "@/lib/queryClient";
import { applicationsQuery } from "@/features/employee/hooks/useCandidateApplications";
import { authedPrefetch } from "@/loaders/prefetch";
import { noindexMeta } from "@/lib/routeMeta";

export { MyApplications as default } from "@/features/employee/MyApplications";

export const clientLoader = authedPrefetch(async () => {
  queryClient.prefetchInfiniteQuery(applicationsQuery("Applied"));
  return null;
});

export const meta = noindexMeta("employeeMyApplications");
