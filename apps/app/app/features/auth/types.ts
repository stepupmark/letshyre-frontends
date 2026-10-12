import type { FORGOT_STEPS } from "./lib/forgot"
import type { STAGES } from "./lib/register"

export type Role = "Employer" | "Candidate"

export type Body = Record<string, unknown>

export type CodePurpose = "Registration" | "Forgot Password"

export type ForgotStep = (typeof FORGOT_STEPS)[number]

export interface ForgotAnswers {
  email: string
  key: string
  sentAt: number
  verified: boolean
}

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
