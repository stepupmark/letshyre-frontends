import { ROLES } from "@workspace/auth"

import { SessionGate } from "@/features/auth"
import { AssistantLauncher } from "@/features/assistant"
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
      <DashboardShell
        area="employer"
        actions={<AssistantLauncher side="employer" />}
      />
    </SessionGate>
  )
}
