import {
  DashboardPage,
  dashboardQueries,
  readDashboardParams,
} from "@/features/dashboard"
import { prefetch } from "@/lib/query/query-client"
import { searchOf } from "@/lib/search-params"

import type { Route } from "./+types/dashboard._index"

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { year, days } = readDashboardParams(searchOf(request))
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

export { shouldRevalidate } from "@/lib/search-params"
