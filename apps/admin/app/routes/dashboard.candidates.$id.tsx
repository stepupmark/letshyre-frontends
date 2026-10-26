import { CandidateProfilePage, candidatesQueries } from "@/features/candidates"
import { prefetch } from "@/lib/query/query-client"

import type { Route } from "./+types/dashboard.candidates.$id"

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  prefetch(candidatesQueries.profile(params.id))
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "Candidate profile · LetsHyre Admin" },
]

export const handle = {
  breadcrumb: "Candidate profile",
  parent: { label: "Candidates", path: "/dashboard/candidates" },
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/feedback/route-error-boundary"

export default CandidateProfilePage
