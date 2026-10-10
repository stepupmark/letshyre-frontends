export const FORGOT_STEPS = ["email", "code", "password"] as const
export type ForgotStep = (typeof FORGOT_STEPS)[number]

export const FORGOT_FLOW = "forgot"

export interface ForgotAnswers {
  email: string
  key: string
  sentAt: number
  verified: boolean
}

export const forgotReachable = (step: ForgotStep, d: Partial<ForgotAnswers>) =>
  ({
    email: true,
    code: Boolean(d.key),
    password: Boolean(d.key && d.verified),
  })[step]
