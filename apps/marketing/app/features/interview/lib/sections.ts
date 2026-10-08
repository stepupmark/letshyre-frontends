export const PHASES = [
  { id: "setup", steps: ["download", "signIn", "dashboard"] },
  { id: "checks", steps: ["clearEnv", "permissions", "verifyId"] },
  { id: "start", steps: ["chooseRole", "begin"] },
] as const

export type StepId = (typeof PHASES)[number]["steps"][number]

const TIP_STEPS = ["clearEnv", "verifyId"] as const
export type TipStepId = (typeof TIP_STEPS)[number]

export const hasTip = (id: StepId): id is TipStepId =>
  (TIP_STEPS as readonly StepId[]).includes(id)

/** Readable, shareable anchors. Keep them stable once published. */
export const STEP_ANCHORS: Record<StepId, string> = {
  download: "download-the-app",
  signIn: "sign-in",
  dashboard: "open-your-dashboard",
  clearEnv: "close-other-apps",
  permissions: "allow-access",
  verifyId: "verify-your-identity",
  chooseRole: "choose-your-role",
  begin: "begin-your-interview",
}

export const REQUIREMENTS = [
  "computer",
  "camera",
  "microphone",
  "internet",
  "room",
] as const

export const REQUIREMENTS_ANCHOR = "before-you-start"
export const PRIVACY_ANCHOR = "what-we-record"
