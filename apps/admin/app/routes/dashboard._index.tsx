import type { Route } from "./+types/dashboard._index";
import {
  DashboardPage,
  dashboardQueries,
  loadDashboardSearchParams,
} from "~/features/dashboard";
import { queryClient } from "~/lib/query/query-client";

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { year, days } = loadDashboardSearchParams(request);
  void queryClient.prefetchQuery(dashboardQueries.revenueSummary());
  void queryClient.prefetchQuery(dashboardQueries.monthlyRevenue(year));
  void queryClient.prefetchQuery(dashboardQueries.activitySummary());
  void queryClient.prefetchQuery(dashboardQueries.dailyActivity(Number(days)));
  return null;
}

export const meta: Route.MetaFunction = () => [
  { title: "Dashboard · LetsHyre Admin" },
];

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary";

export default DashboardPage;
