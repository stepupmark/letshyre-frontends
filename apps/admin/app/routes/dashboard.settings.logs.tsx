import type { Route } from "./+types/dashboard.settings.logs"
import { LogsPage, loadLogsSearchParams, logsQueries } from "@/features/logs"
import { prefetch } from "@/lib/query/query-client"

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { channel, page } = loadLogsSearchParams(request)
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
