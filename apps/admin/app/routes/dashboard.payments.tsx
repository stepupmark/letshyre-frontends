import type { Route } from "./+types/dashboard.payments"
import {
  readPaymentsParams,
  PaymentsPage,
  paymentsQueries,
  toPaymentFilters,
} from "@/features/payments"
import { prefetch } from "@/lib/query/query-client"
import { searchOf } from "@/lib/search-params"

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const filters = toPaymentFilters(readPaymentsParams(searchOf(request)))
  prefetch(paymentsQueries.summary())
  prefetch(paymentsQueries.list(filters))
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "Payments · LetsHyre Admin" },
]

export const handle = { breadcrumb: "Payments history" }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/feedback/route-error-boundary"

export default PaymentsPage

export { shouldRevalidate } from "@/lib/search-params"
