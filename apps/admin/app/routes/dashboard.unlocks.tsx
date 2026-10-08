import type { Route } from "./+types/dashboard.unlocks"
import {
  loadUnlocksSearchParams,
  toUnlocksFilters,
  UnlocksPage,
  unlocksQueries,
} from "@/features/unlocks"
import { prefetch } from "@/lib/query/query-client"

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const filters = toUnlocksFilters(loadUnlocksSearchParams(request))
  prefetch(unlocksQueries.overview())
  prefetch(unlocksQueries.list(filters))
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "Unlocks · LetsHyre Admin" },
]

export const handle = { breadcrumb: "Unlocks" }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/feedback/route-error-boundary"

export default UnlocksPage
