import type { Route } from "./+types/dashboard.credits"
import { CreditsPage, creditsQueries } from "~/features/credits"
import { queryClient } from "~/lib/query/query-client"

export function clientLoader() {
  void queryClient.prefetchQuery(creditsQueries.detail())
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "Credits · LetsHyre Admin" },
]

export const handle = { breadcrumb: "Credits" }

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary"

export default CreditsPage
