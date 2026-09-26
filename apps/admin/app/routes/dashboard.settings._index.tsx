import type { Route } from "./+types/dashboard.settings._index";
import {
  SystemConfigPage,
  systemConfigQueries,
} from "~/features/system-config";
import { queryClient } from "~/lib/query/query-client";

export function clientLoader() {
  void queryClient.prefetchQuery(systemConfigQueries.detail());
  return null;
}

export const meta: Route.MetaFunction = () => [
  { title: "Settings · LetsHyre Admin" },
];

export const handle = { breadcrumb: "Settings" };

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary";

export default SystemConfigPage;
