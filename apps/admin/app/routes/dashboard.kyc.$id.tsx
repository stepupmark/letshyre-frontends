import type { Route } from "./+types/dashboard.kyc.$id"
import { KycReviewPage, kycQueries } from "@/features/kyc"
import { prefetch } from "@/lib/query/query-client"

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  prefetch(kycQueries.detail(params.id))
  return null
}

export const meta: Route.MetaFunction = () => [
  { title: "KYC review · LetsHyre Admin" },
]

export const handle = {
  breadcrumb: "KYC review",
  parent: { label: "KYC verification", path: "/dashboard/kyc" },
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/feedback/route-error-boundary"

export default KycReviewPage
