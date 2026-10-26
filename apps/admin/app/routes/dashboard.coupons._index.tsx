import { CouponsPage, couponsQueries } from "@/features/coupons"
import { prefetch } from "@/lib/query/query-client"
import { pageOf, searchOf } from "@/lib/search-params"

import type { Route } from "./+types/dashboard.coupons._index"

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  prefetch(couponsQueries.list(pageOf(searchOf(request))))
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "Coupons · LetsHyre Admin" },
]

export const handle = { breadcrumb: "Coupons" }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/feedback/route-error-boundary"

export default CouponsPage

export { shouldRevalidate } from "@/lib/search-params"
