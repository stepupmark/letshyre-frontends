import type { ReactNode } from "react"

import type { StepId } from "../../lib/sections"
import {
  BeginScreen,
  ChooseRoleScreen,
  PermissionsScreen,
  VerifyIdScreen,
} from "./check-screens"
import {
  ClearEnvScreen,
  DashboardScreen,
  DownloadScreen,
  SignInScreen,
} from "./start-screens"

const SCREENS: Record<StepId, () => ReactNode> = {
  download: DownloadScreen,
  signIn: SignInScreen,
  dashboard: DashboardScreen,
  clearEnv: ClearEnvScreen,
  permissions: PermissionsScreen,
  verifyId: VerifyIdScreen,
  chooseRole: ChooseRoleScreen,
  begin: BeginScreen,
}

/** What the desktop app shows at each step, sketched. */
export function StepScreen({ step }: { step: StepId }) {
  const Screen = SCREENS[step]
  return (
    <svg viewBox="0 0 240 140" aria-hidden="true" className="w-full">
      <rect
        x={8}
        y={6}
        width={224}
        height={128}
        rx={12}
        className="fill-card stroke-border"
      />
      {[22, 32, 42].map((cx) => (
        <circle
          key={cx}
          cx={cx}
          cy={19}
          r={3}
          className="fill-muted-foreground/25"
        />
      ))}
      <rect x={8} y={32} width={224} height={1} className="fill-border" />
      <Screen />
    </svg>
  )
}
