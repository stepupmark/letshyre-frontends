import { ROLES } from "@workspace/auth"

import { guard } from "@/lib/guard"
import { namespaces } from "@/lib/i18n"

import { OnboardingShell } from "./onboarding-shell"

export const clientMiddleware = [
  guard([ROLES.employer]),
  namespaces(["shell", "auth", "onboarding"]),
]

export default OnboardingShell
