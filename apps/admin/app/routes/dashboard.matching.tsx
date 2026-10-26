import { ComingSoon } from "@/components/feedback/coming-soon"

import type { Route } from "./+types/dashboard.matching"

export const meta: Route.MetaFunction = () => [
  { title: "Matching · LetsHyre Admin" },
]

export const handle = { breadcrumb: "Matching" }

export default function Page() {
  return (
    <ComingSoon
      title="Matching"
      description="Candidate and employer matching."
    />
  )
}
