import type { Route } from "./+types/dashboard.jobs._index"
import {
  JobsPage,
  jobsQueries,
  readJobsParams,
  toJobsFilters,
} from "@/features/jobs"
import { prefetch } from "@/lib/query/query-client"
import { searchOf } from "@/lib/search-params"

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const filters = toJobsFilters(readJobsParams(searchOf(request)))
  prefetch(jobsQueries.summary())
  prefetch(jobsQueries.list(filters))
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "Jobs · LetsHyre Admin" },
]

export const handle = { breadcrumb: "Jobs" }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/feedback/route-error-boundary"

export default JobsPage

export { shouldRevalidate } from "@/lib/search-params"
