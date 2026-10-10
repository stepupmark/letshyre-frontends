import type { Role } from "../api"

export const STAGES = ["about", "email", "mobile", "password"] as const
export type Stage = (typeof STAGES)[number]

export interface RegisterAnswers {
  name: string
  /** what's in the email box right now, for the card */
  draftEmail: string
  email: string
  emailKey: string
  emailSentAt: number
  emailVerified: boolean
  phone: string
  mobileKey: string
  mobileSentAt: number
  mobileVerified: boolean
  done: boolean
}

export const registerFlowName = (role: Role) => `register:${role}`

export const reachable = (stage: Stage, d: Partial<RegisterAnswers>) =>
  ({
    about: true,
    email: Boolean(d.emailKey),
    mobile: Boolean(d.emailVerified),
    password: Boolean(d.emailVerified && d.mobileVerified),
  })[stage]
