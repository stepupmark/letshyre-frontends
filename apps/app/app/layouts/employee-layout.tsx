import { ROLES } from "@workspace/auth"

import { DashboardShell } from "@/features/shell"
import { guard } from "@/lib/guard"
import { namespaces } from "@/lib/i18n"

export const clientMiddleware = [
  guard([ROLES.candidate]),
  namespaces(["shell"]),
]

export default function EmployeeLayout() {
  return <DashboardShell area="candidate" />
}
