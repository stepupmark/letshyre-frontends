import {
  readUnlocksParams,
  toUnlocksFilters,
  UnlocksPage,
  unlocksQueries,
} from "@/features/unlocks"
import { prefetch } from "@/lib/query/query-client"
import { searchOf } from "@/lib/search-params"

import type { Route } from "./+types/dashboard.unlocks"

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const filters = toUnlocksFilters(readUnlocksParams(searchOf(request)))
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

export { shouldRevalidate } from "@/lib/search-params"
