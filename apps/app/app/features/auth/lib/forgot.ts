import type { ForgotAnswers, ForgotStep } from "../types"

export const FORGOT_STEPS = ["email", "code", "password"] as const

export const FORGOT_FLOW = "forgot"

export const forgotReachable = (step: ForgotStep, d: Partial<ForgotAnswers>) =>
  ({
    email: true,
    code: Boolean(d.key),
    password: Boolean(d.key && d.verified),
  })[step]
