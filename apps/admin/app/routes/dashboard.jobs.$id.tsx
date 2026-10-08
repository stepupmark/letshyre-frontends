import type { Route } from "./+types/dashboard.jobs.$id";
import { JobDetailPage, jobsQueries } from "~/features/jobs";
import { queryClient } from "~/lib/query/query-client";

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  void queryClient.prefetchQuery(jobsQueries.detail(params.id));
  return null;
}

export const meta: Route.MetaFunction = () => [
  { title: "Job details · LetsHyre Admin" },
];

export const handle = {
  breadcrumb: "Job details",
  parent: { label: "Jobs", path: "/dashboard/jobs" },
};

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary";

export default JobDetailPage;
