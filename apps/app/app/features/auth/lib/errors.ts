import { errorKey } from "@workspace/api"
import { AccountInactiveError } from "@workspace/auth"

// exact backend messages, normalised (lowercase, no punctuation)
const MESSAGES: Record<string, string> = {
  "invalid credentials": "errors.invalidCredentials",
  "an account with this email already exists": "errors.emailExists",
  "phone number is already registered": "errors.phoneExists",
  "the entered otp is incorrect please try again": "errors.otpIncorrect",
  "incorrect otp please try again": "errors.otpIncorrect",
  "the otp has expired please request a new one": "errors.otpExpired",
  "invalid or unverified otp for email": "errors.otpSessionInvalid",
  "no account found with this email address": "errors.emailNotFound",
}

const HEURISTICS = [
  {
    test: (m: string) => m.includes("otp") && m.includes("expired"),
    key: "errors.otpExpired",
  },
  {
    test: (m: string) =>
      m.includes("otp") && (m.includes("incorrect") || m.includes("invalid")),
    key: "errors.otpIncorrect",
  },
  {
    test: (m: string) => m.includes("already") && m.includes("email"),
    key: "errors.emailExists",
  },
  {
    test: (m: string) =>
      m.includes("already") && (m.includes("phone") || m.includes("mobile")),
    key: "errors.phoneExists",
  },
  {
    test: (m: string) => m.includes("no account") && m.includes("email"),
    key: "errors.emailNotFound",
  },
]

export type AuthErrorKey =
  | "errors.invalidCredentials"
  | "errors.accountInactive"
  | "errors.tooManyAttempts"
  | "errors.network"
  | "errors.server"
  | "errors.emailExists"
  | "errors.phoneExists"
  | "errors.otpIncorrect"
  | "errors.otpExpired"
  | "errors.otpSessionInvalid"
  | "errors.emailNotFound"
  | "errors.signInFailed"
  | "errors.sendFailed"
  | "errors.registerFailed"
  | "errors.resetFailed"

export function authErrorKey(
  error: unknown,
  fallback: AuthErrorKey
): AuthErrorKey {
  if (error instanceof AccountInactiveError) return "errors.accountInactive"
  return errorKey(error, {
    messages: MESSAGES,
    heuristics: HEURISTICS,
    fallback,
  }) as AuthErrorKey
}

/** After the code step: the verification is gone and the flow starts over. */
export const isVerificationLost = (key: AuthErrorKey) =>
  key === "errors.otpSessionInvalid" || key === "errors.otpExpired"

/** Errors that belong to one field rather than the whole form. */
export const FIELD_OF: Partial<Record<AuthErrorKey, "email" | "phone">> = {
  "errors.emailExists": "email",
  "errors.emailNotFound": "email",
  "errors.phoneExists": "phone",
}
