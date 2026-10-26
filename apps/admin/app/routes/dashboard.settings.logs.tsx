import { LogsPage, readLogsParams, logsQueries } from "@/features/logs"
import { prefetch } from "@/lib/query/query-client"
import { searchOf } from "@/lib/search-params"

import type { Route } from "./+types/dashboard.settings.logs"

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { channel, page } = readLogsParams(searchOf(request))
  if (channel === "email") prefetch(logsQueries.email(page))
  else prefetch(logsQueries.sms(page))
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "Logs · LetsHyre Admin" },
]

export const handle = { breadcrumb: "Logs" }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/feedback/route-error-boundary"

export default LogsPage

export { shouldRevalidate } from "@/lib/search-params"
