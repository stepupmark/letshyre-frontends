export const STEPS = [
  "download",
  "signIn",
  "dashboard",
  "clearEnv",
  "permissions",
  "verifyId",
  "chooseRole",
  "begin",
] as const

export type StepId = (typeof STEPS)[number]

export const TIPS = {
  clearEnv: "steps.clearEnv.tip",
  verifyId: "steps.verifyId.tip",
} as const satisfies Partial<Record<StepId, string>>

export const tipFor = (id: StepId) =>
  id in TIPS ? TIPS[id as keyof typeof TIPS] : undefined

export const REQUIREMENTS = [
  "computer",
  "camera",
  "microphone",
  "internet",
  "room",
] as const

export const stepAnchor = (id: StepId) => `step-${id}`

export const REQUIREMENTS_ANCHOR = "requirements"
