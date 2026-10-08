import type { Route } from "./+types/dashboard.jobs._index";
import {
  JobsPage,
  jobsQueries,
  loadJobsSearchParams,
  toJobsFilters,
} from "~/features/jobs";
import { queryClient } from "~/lib/query/query-client";

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const filters = toJobsFilters(loadJobsSearchParams(request));
  void queryClient.prefetchQuery(jobsQueries.summary());
  void queryClient.prefetchQuery(jobsQueries.list(filters));
  return null;
}

export const meta: Route.MetaFunction = () => [
  { title: "Jobs · LetsHyre Admin" },
];

export const handle = { breadcrumb: "Jobs" };

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary";

export default JobsPage;
