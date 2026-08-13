/**
 * auth.api.ts
 *
 * Pure API-layer functions for authentication.
 * No React, no hooks, no context — just data fetching.
 */

import { apiClient } from "./axiosInstance";
import { extractMessage } from "./apiError";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  is_superuser: boolean;
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginUser;
}

export type SendOtpPayload = {
  email: string;
  otp_type: "Forgot Password";
};

export type SendOtpResponse = {
  message: string;
  otp_session_key: string;
};

export type VerifyOtpPayload = {
  email: string;
  otp: string;
  otp_session_key: string;
  otp_type: string;
};

export type VerifyOtpResponse = {
  status: boolean;
  message: string;
};

export type ResetPasswordPayload = {
  email: string;
  new_password: string;
  confirm_password: string;
};

export type ResetPasswordResponse = {
  success: boolean;
  message: string;
};

// ─── API Function ─────────────────────────────────────────────────────────────

/**
 * POST user/v1/login/
 *
 * Always throws an `Error` with a human-readable message so that
 * React Query's `error` object is never a raw Axios error string.
 */
export async function loginUser(payload: LoginPayload): Promise<LoginUser> {
  try {
    const { data } = await apiClient.post<LoginResponse>(
      "user/v1/login/",
      payload,
    );

    // HTTP 200 but success: false (shouldn't normally happen for login, but handle it)
    if (!data.success) {
      throw new Error(data.message ?? "Login failed.");
    }

    return data.data;
  } catch (err) {
    // Re-throw errors that we already normalised above (plain Error instances
    // created by the success-false branch).
    if (
      err instanceof Error &&
      !(err as { isAxiosError?: boolean }).isAxiosError
    ) {
      throw err;
    }
    // For AxiosErrors (4xx / 5xx / network), extract the server message.
    throw new Error(extractMessage(err));
  }
}

export const sendOtp = async (data: SendOtpPayload) => {
  try {
    return await apiClient.post<SendOtpResponse>(
      "commonapp/v1/send_otp/",
      data,
    );
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};

export const verifyOtp = async (data: VerifyOtpPayload) => {
  try {
    return await apiClient.post<VerifyOtpResponse>(
      "commonapp/v1/verify_otp/",
      data,
    );
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};

export const resetPassword = async (data: ResetPasswordPayload) => {
  try {
    return await apiClient.post<ResetPasswordResponse>(
      "user/v1/forgot_password/",
      data,
    );
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};

export const logoutUser = async (data: { refresh_token: string }) => {
  try {
    return await apiClient.post("user/v1/logout/", data);
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};
