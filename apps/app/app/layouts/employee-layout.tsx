import { ROLES } from "@workspace/auth"
import { useQuery } from "@tanstack/react-query"
import { href, Navigate } from "react-router"

import { SessionGate } from "@/features/auth"
import { myProfileQuery } from "@/features/candidate-onboarding"
import { AssistantLauncher } from "@/features/assistant"
import { DashboardShell } from "@/features/shell"
import { guard } from "@/lib/guard"
import { namespaces } from "@/lib/i18n"

export const clientMiddleware = [
  guard([ROLES.candidate]),
  namespaces(["shell", "auth"]),
]

export default function EmployeeLayout() {
  const me = useQuery(myProfileQuery())
  // wait for the profile so a candidate without one never sees the dashboard
  if (me.isPending) return <div aria-busy="true" className="min-h-svh" />
  if (me.data?.is_profile_complete === false)
    return <Navigate to={href("/employee/onboarding")} replace />

  return (
    <SessionGate>
      <DashboardShell
        area="candidate"
        actions={<AssistantLauncher side="candidate" />}
      />
    </SessionGate>
  )
}
