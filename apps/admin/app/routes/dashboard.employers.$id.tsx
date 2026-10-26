import { EmployerProfilePage, employersQueries } from "@/features/employers"
import { prefetch } from "@/lib/query/query-client"

import type { Route } from "./+types/dashboard.employers.$id"

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  prefetch(employersQueries.detail(params.id))
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "Employer profile · LetsHyre Admin" },
]

export const handle = {
  breadcrumb: "Employer profile",
  parent: { label: "Employers", path: "/dashboard/employers" },
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/feedback/route-error-boundary"

export default EmployerProfilePage
