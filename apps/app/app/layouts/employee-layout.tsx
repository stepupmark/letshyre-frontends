import { ROLES } from "@workspace/auth"
import { useQuery } from "@tanstack/react-query"
import { Navigate } from "react-router"

import { SessionGate } from "@/features/auth"
import { myProfileQuery } from "@/features/candidate-onboarding"
import { DashboardShell } from "@/features/shell"
import { guard } from "@/lib/guard"
import { namespaces } from "@/lib/i18n"

export const clientMiddleware = [
  guard([ROLES.candidate]),
  namespaces(["shell", "auth"]),
]

export default function EmployeeLayout() {
  const me = useQuery(myProfileQuery())
  // nothing here works for a candidate without a profile yet
  if (me.data?.is_profile_complete === false)
    return <Navigate to="/employee/onboarding" replace />

  return (
    <SessionGate>
      <DashboardShell area="candidate" />
    </SessionGate>
  )
}
