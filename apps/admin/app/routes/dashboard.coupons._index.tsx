import type { Route } from "./+types/dashboard.coupons._index"
import { CouponsPage, couponsQueries } from "@/features/coupons"
import { prefetch } from "@/lib/query/query-client"
import { loadPageParam } from "@/lib/search-params"

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  prefetch(couponsQueries.list(loadPageParam(request).page))
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "Coupons · LetsHyre Admin" },
]

export const handle = { breadcrumb: "Coupons" }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/feedback/route-error-boundary"

export default CouponsPage
