import { ComingSoon } from "@/components/feedback/coming-soon"

import type { Route } from "./+types/dashboard.notifications"

export const meta: Route.MetaFunction = () => [
  { title: "Notification scheduler · LetsHyre Admin" },
]

export const handle = { breadcrumb: "Notifications" }

export default function Page() {
  return (
    <ComingSoon
      title="Notification scheduler"
      description="Schedule notifications for candidates and recruiters."
    />
  )
}
