import type { Route } from "./+types/dashboard.candidates._index"
import {
  CandidatesPage,
  candidatesQueries,
  loadCandidatesSearchParams,
  toCandidateFilters,
} from "@/features/candidates"
import { prefetch } from "@/lib/query/query-client"

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const filters = toCandidateFilters(loadCandidatesSearchParams(request))
  prefetch(candidatesQueries.summary())
  prefetch(candidatesQueries.list(filters))
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "Candidates · LetsHyre Admin" },
]

export const handle = { breadcrumb: "Candidates" }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/feedback/route-error-boundary"

export default CandidatesPage
