import { NewGatewayPage } from "@/features/payment-gateways"

import type { Route } from "./+types/dashboard.payment-gateways.new"

export const meta: Route.MetaFunction = () => [
  { title: "Add gateway · LetsHyre Admin" },
]

export const handle = {
  breadcrumb: "Add gateway",
  parent: { label: "Payment gateways", path: "/dashboard/payment-gateways" },
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/feedback/route-error-boundary"

export default NewGatewayPage
