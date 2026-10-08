import type { Route } from "./+types/dashboard._index"
import {
  DashboardPage,
  dashboardQueries,
  loadDashboardSearchParams,
} from "@/features/dashboard"
import { prefetch } from "@/lib/query/query-client"

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { year, days } = loadDashboardSearchParams(request)
  prefetch(dashboardQueries.revenueSummary())
  prefetch(dashboardQueries.monthlyRevenue(year))
  prefetch(dashboardQueries.activitySummary())
  prefetch(dashboardQueries.dailyActivity(Number(days)))
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "Dashboard · LetsHyre Admin" },
]

export { RouteErrorBoundary as ErrorBoundary } from "@/components/feedback/route-error-boundary"

export default DashboardPage
