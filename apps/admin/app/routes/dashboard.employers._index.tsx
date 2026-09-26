import type { Route } from "./+types/dashboard.employers._index";
import { EmployersPage, employersQueries } from "~/features/employers";
import { queryClient } from "~/lib/query/query-client";
import { loadPageParam } from "~/lib/search-params";

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  void queryClient.prefetchQuery(employersQueries.summary());
  void queryClient.prefetchQuery(
    employersQueries.list(loadPageParam(request).page),
  );
  return null;
}

export const meta: Route.MetaFunction = () => [
  { title: "Employers · LetsHyre Admin" },
];

export const handle = { breadcrumb: "Employers" };

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary";

export default EmployersPage;
