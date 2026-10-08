import type { z } from "zod"
import type {
  adminProfileSchema,
  changePasswordSchema,
  loginSchema,
  requestOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "./schemas/auth.schema"

export type LoginInput = z.infer<typeof loginSchema>
export type RequestOtpInput = z.infer<typeof requestOtpSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type AdminProfile = z.infer<typeof adminProfileSchema>

export interface OtpSession {
  email: string
  otpSessionKey: string
}
