import type { Route } from "./+types/dashboard.payments";
import {
  loadPaymentsSearchParams,
  PaymentsPage,
  paymentsQueries,
  toPaymentFilters,
} from "~/features/payments";
import { queryClient } from "~/lib/query/query-client";

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const filters = toPaymentFilters(loadPaymentsSearchParams(request));
  void queryClient.prefetchQuery(paymentsQueries.summary());
  void queryClient.prefetchQuery(paymentsQueries.list(filters));
  return null;
}

export const meta: Route.MetaFunction = () => [
  { title: "Payments · LetsHyre Admin" },
];

export const handle = { breadcrumb: "Payments history" };

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary";

export default PaymentsPage;
