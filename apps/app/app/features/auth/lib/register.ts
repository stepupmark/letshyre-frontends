import type { Role } from "../types"
import type { RegisterAnswers, Stage } from "../types"

export const STAGES = ["about", "email", "mobile", "password"] as const

export const registerFlowName = (role: Role) => `register:${role}`

export const reachable = (stage: Stage, d: Partial<RegisterAnswers>) =>
  ({
    about: true,
    email: Boolean(d.emailKey),
    mobile: Boolean(d.emailVerified),
    password: Boolean(d.emailVerified && d.mobileVerified),
  })[stage]
