import {
  PaymentGatewaysPage,
  paymentGatewaysQueries,
} from "@/features/payment-gateways"
import { prefetch } from "@/lib/query/query-client"

import type { Route } from "./+types/dashboard.payment-gateways._index"

export function clientLoader() {
  prefetch(paymentGatewaysQueries.list())
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "Payment gateways · LetsHyre Admin" },
]

export const handle = { breadcrumb: "Payment gateways" }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/feedback/route-error-boundary"

export default PaymentGatewaysPage
