import { login, logout, ROLES } from "@workspace/auth"

import { api } from "@/lib/api"
import { ApiError } from "@/lib/api/api-error"
import { envelope } from "@/lib/api/schemas"

import {
  adminProfileSchema,
  sendOtpResultSchema,
  statusResultSchema,
} from "../schemas/auth.schema"
import type { LoginInput, OtpSession } from "../types"

const OTP_TYPE = "Forgot Password"

function assertOk(
  result: { status?: boolean; success?: boolean; message?: string },
  fallback: string
) {
  if (result.status === false || result.success === false) {
    throw new ApiError(result.message || fallback, 400)
  }
}

export const authService = {
  login: (input: LoginInput) => login(api, input, { roles: [ROLES.admin] }),

  logout: () => logout(api),

  async getProfile(signal?: AbortSignal) {
    const data = await api.get("user/v1/admin/profile/", { signal })
    return envelope(adminProfileSchema).parse(data).data
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await api.post("user/v1/admin/change/password/", {
      old_password: currentPassword,
      new_password: newPassword,
    })
  },

  async sendOtp(email: string): Promise<OtpSession> {
    const data = await api.post(
      "commonapp/v1/send_otp/",
      { email, otp_type: OTP_TYPE },
      { auth: false }
    )
    return {
      email,
      otpSessionKey: sendOtpResultSchema.parse(data).otp_session_key,
    }
  },

  async verifyOtp(session: OtpSession, otp: string) {
    const data = await api.post(
      "commonapp/v1/verify_otp/",
      {
        email: session.email,
        otp,
        otp_session_key: session.otpSessionKey,
        otp_type: OTP_TYPE,
      },
      { auth: false }
    )
    assertOk(statusResultSchema.parse(data), "Invalid code")
  },

  async resetPassword(session: OtpSession, password: string) {
    const data = await api.post(
      "user/v1/forgot_password/",
      {
        email: session.email,
        otp_session_key: session.otpSessionKey,
        new_password: password,
        confirm_password: password,
      },
      { auth: false }
    )
    assertOk(statusResultSchema.parse(data), "Couldn't reset the password")
  },
}
