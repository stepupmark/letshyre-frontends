import type { Route } from "./+types/dashboard.unlocks";
import {
  loadUnlocksSearchParams,
  toUnlocksFilters,
  UnlocksPage,
  unlocksQueries,
} from "~/features/unlocks";
import { queryClient } from "~/lib/query/query-client";

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const filters = toUnlocksFilters(loadUnlocksSearchParams(request));
  void queryClient.prefetchQuery(unlocksQueries.overview());
  void queryClient.prefetchQuery(unlocksQueries.list(filters));
  return null;
}

export const meta: Route.MetaFunction = () => [
  { title: "Unlocks · LetsHyre Admin" },
];

export const handle = { breadcrumb: "Unlocks" };

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary";

export default UnlocksPage;
