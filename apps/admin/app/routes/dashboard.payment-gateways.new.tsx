import type { Route } from "./+types/dashboard.payment-gateways.new";
import { NewGatewayPage } from "~/features/payment-gateways";

export const meta: Route.MetaFunction = () => [
  { title: "Add gateway · LetsHyre Admin" },
];

export const handle = { breadcrumb: "Add gateway" };

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary";

export default NewGatewayPage;
