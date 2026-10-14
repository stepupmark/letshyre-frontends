import type { StepKey } from "../lib/guide-steps"
import { BeginScene, RoleScene } from "./scenes/interview-scenes"
import {
  ClearScene,
  PermissionsScene,
  VerifyScene,
} from "./scenes/security-scenes"
import {
  DashboardScene,
  DownloadScene,
  SignInScene,
} from "./scenes/setup-scenes"

const SCENES = {
  download: DownloadScene,
  signIn: SignInScene,
  dashboard: DashboardScene,
  clearEnv: ClearScene,
  permissions: PermissionsScene,
  verifyId: VerifyScene,
  chooseRole: RoleScene,
  begin: BeginScene,
} satisfies Record<StepKey, (props: { play: boolean }) => React.ReactNode>

/** What the step looks like in the desktop app; replays each time it's shown. */
export function Scene({ step, play }: { step: StepKey; play: boolean }) {
  const Current = SCENES[step]
  return <Current key={`${step}-${String(play)}`} play={play} />
}
