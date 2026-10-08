import type { Route } from "./+types/dashboard.coupons.new"
import { NewCouponPage } from "~/features/coupons"

export const meta: Route.MetaFunction = () => [
  { title: "New coupon · LetsHyre Admin" },
]

export const handle = {
  breadcrumb: "New coupon",
  parent: { label: "Coupons", path: "/dashboard/coupons" },
}

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary"

export default NewCouponPage
