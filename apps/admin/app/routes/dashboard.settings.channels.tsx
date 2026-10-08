import type { Route } from "./+types/dashboard.settings.channels"
import { ChannelsPage, channelsQueries } from "~/features/channels"
import { queryClient } from "~/lib/query/query-client"

export function clientLoader() {
  void queryClient.prefetchQuery(channelsQueries.settings())
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "Channels · LetsHyre Admin" },
]

export const handle = { breadcrumb: "Channels" }

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary"

export default ChannelsPage
