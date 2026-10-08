import type { Route } from "./+types/dashboard.kyc._index"
import { KycListPage, kycQueries, loadKycSearchParams } from "~/features/kyc"
import { queryClient } from "~/lib/query/query-client"

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { page, status } = loadKycSearchParams(request)
  void queryClient.prefetchQuery(kycQueries.list(page, status))
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "KYC verification · LetsHyre Admin" },
]

export const handle = { breadcrumb: "KYC verification" }

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary"

export default KycListPage
