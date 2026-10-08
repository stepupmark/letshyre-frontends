import type { Route } from "./+types/dashboard.employers.$id"
import { EmployerProfilePage, employersQueries } from "~/features/employers"
import { queryClient } from "~/lib/query/query-client"

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  void queryClient.prefetchQuery(employersQueries.detail(params.id))
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "Employer profile · LetsHyre Admin" },
]

export const handle = {
  breadcrumb: "Employer profile",
  parent: { label: "Employers", path: "/dashboard/employers" },
}

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary"

export default EmployerProfilePage
