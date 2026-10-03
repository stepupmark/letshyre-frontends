import { queryClient } from "@/lib/queryClient";
import { employerProfileQuery } from "@/features/employer/hooks/useEmployerProfile";
import { authedPrefetch } from "@/loaders/prefetch";
import { noindexMeta } from "@/lib/routeMeta";

export { EmployerProfile as default } from "@/features/employer/EmployerProfile";

export const clientLoader = authedPrefetch(async () => {
  queryClient.prefetchQuery(employerProfileQuery());
  return null;
});

export const meta = noindexMeta("employerProfile");
