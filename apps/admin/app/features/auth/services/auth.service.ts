import { ApiError } from "~/lib/api/api-error";
import { http } from "~/lib/api/http-client";
import { envelope } from "~/lib/api/schemas";
import {
  adminProfileSchema,
  loginResultSchema,
  sendOtpResultSchema,
  statusResultSchema,
} from "../schemas/auth.schema";
import type { LoginInput, OtpSession } from "../types";

const OTP_TYPE = "Forgot Password";

function assertOk(result: { status?: boolean; success?: boolean; message?: string }, fallback: string) {
  if (result.status === false || result.success === false) {
    throw new ApiError(result.message || fallback, 400);
  }
}

export const authService = {
  async login(payload: LoginInput) {
    const { data } = await http.post("user/v1/login/", payload, { skipAuth: true });
    const body = envelope(loginResultSchema).parse(data);
    if (body.success === false) throw new ApiError(body.message || "Login failed", 400);
    return body.data;
  },

  async logout(refreshToken: string) {
    await http.post("user/v1/logout/", { refresh_token: refreshToken }, { skipRefresh: true });
  },

  async getProfile(signal?: AbortSignal) {
    const { data } = await http.get("user/v1/admin/profile/", { signal });
    return envelope(adminProfileSchema).parse(data).data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await http.post("user/v1/admin/change/password/", {
      old_password: currentPassword,
      new_password: newPassword,
    });
  },

  async sendOtp(email: string): Promise<OtpSession> {
    const { data } = await http.post(
      "commonapp/v1/send_otp/",
      { email, otp_type: OTP_TYPE },
      { skipAuth: true },
    );
    return { email, otpSessionKey: sendOtpResultSchema.parse(data).otp_session_key };
  },

  async verifyOtp(session: OtpSession, otp: string) {
    const { data } = await http.post(
      "commonapp/v1/verify_otp/",
      { email: session.email, otp, otp_session_key: session.otpSessionKey, otp_type: OTP_TYPE },
      { skipAuth: true },
    );
    assertOk(statusResultSchema.parse(data), "Invalid code");
  },

  async resetPassword(email: string, password: string) {
    const { data } = await http.post(
      "user/v1/forgot_password/",
      { email, new_password: password, confirm_password: password },
      { skipAuth: true },
    );
    assertOk(statusResultSchema.parse(data), "Couldn't reset the password");
  },
};
