import type { Route } from "./+types/dashboard.employers._index"
import { EmployersPage, employersQueries } from "@/features/employers"
import { prefetch } from "@/lib/query/query-client"
import { pageOf, searchOf } from "@/lib/search-params"

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  prefetch(employersQueries.summary())
  prefetch(employersQueries.list(pageOf(searchOf(request))))
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "Employers · LetsHyre Admin" },
]

export const handle = { breadcrumb: "Employers" }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/feedback/route-error-boundary"

export default EmployersPage

export { shouldRevalidate } from "@/lib/search-params"
