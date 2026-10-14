export const PHASES = [
  { id: "setup", steps: ["download", "signIn", "dashboard"] },
  { id: "security", steps: ["clearEnv", "permissions", "verifyId"] },
  { id: "interview", steps: ["chooseRole", "begin"] },
] as const

export type StepKey = (typeof PHASES)[number]["steps"][number]

export const STEPS: readonly StepKey[] = PHASES.flatMap((phase) => phase.steps)

const WITH_TIP = ["clearEnv", "verifyId"] as const
export const hasTip = (step: StepKey): step is (typeof WITH_TIP)[number] =>
  (WITH_TIP as readonly StepKey[]).includes(step)
