import { queryClient } from "@/lib/queryClient";
import { dashboardStatsQuery } from "@/features/employer/hooks/useDashboard";
import { authedPrefetch } from "@/loaders/prefetch";

export { EmployerDashboard as default } from "@/features/employer/EmployerDashboard";

export const clientLoader = authedPrefetch(async () => {
  queryClient.prefetchQuery(dashboardStatsQuery());
  return null;
});
