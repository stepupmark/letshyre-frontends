import type { Route } from "./+types/dashboard.payment-gateways._index";
import {
  PaymentGatewaysPage,
  paymentGatewaysQueries,
} from "~/features/payment-gateways";
import { queryClient } from "~/lib/query/query-client";

export function clientLoader() {
  void queryClient.prefetchQuery(paymentGatewaysQueries.list());
  return null;
}

export const meta: Route.MetaFunction = () => [
  { title: "Payment gateways · LetsHyre Admin" },
];

export const handle = { breadcrumb: "Payment gateways" };

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary";

export default PaymentGatewaysPage;
