import { ROLES } from "@workspace/auth"

import { SessionGate } from "@/features/auth"
import { DashboardShell } from "@/features/shell"
import { guard } from "@/lib/guard"
import { namespaces } from "@/lib/i18n"

export const clientMiddleware = [
  guard([ROLES.candidate]),
  namespaces(["shell", "auth"]),
]

export default function EmployeeLayout() {
  return (
    <SessionGate>
      <DashboardShell area="candidate" />
    </SessionGate>
  )
}
