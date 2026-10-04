import { ROLES } from "@workspace/auth"

import { SessionGate } from "@/features/auth"
import { DashboardShell } from "@/features/shell"
import { guard } from "@/lib/guard"
import { namespaces } from "@/lib/i18n"

export const clientMiddleware = [
  guard([ROLES.employer]),
  namespaces(["shell", "auth"]),
]

export default function EmployerLayout() {
  return (
    <SessionGate>
      <DashboardShell area="employer" />
    </SessionGate>
  )
}
