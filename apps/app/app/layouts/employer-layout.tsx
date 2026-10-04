import { ROLES } from "@workspace/auth"

import { DashboardShell } from "@/features/shell"
import { guard } from "@/lib/guard"
import { namespaces } from "@/lib/i18n"

export const clientMiddleware = [guard([ROLES.employer]), namespaces(["shell"])]

export default function EmployerLayout() {
  return <DashboardShell area="employer" />
}
