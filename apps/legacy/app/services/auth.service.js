import api from "./api";
import { getErrorMessage } from "@/lib/errorHandler";
import { AuthError } from "@/lib/authErrorMessages";
import {
  setAccessToken,
  setRefreshToken,
  setUser,
  getRefreshToken,
  clearAuth,
} from "@/lib/authStorage";

const getResponseData = (res) => {
  if (res?.data?.success === false) {
    throw new AuthError(res.data.message, {
      status: res.status,
      backendMessage: res.data.message,
    });
  }
  return res?.data?.data || res?.data || {};
};

const toAuthError = (error) =>
  error instanceof AuthError
    ? error
    : new AuthError(getErrorMessage(error), {
        status: error?.response?.status,
        backendMessage: error?.response?.data?.message,
      });

/**
 * OTP endpoints have historically returned the session key under a few
 * different shapes. Normalize to a single `otpSessionKey` so callers never
 * have to guess (and never silently drop it).
 */
const extractSessionKey = (data) =>
  data?.otp_session_key ||
  data?.session_key ||
  data?.data?.otp_session_key ||
  null;

export const login = async (credentials) => {
  try {
    const res = await api.post("/user/v1/login/", credentials);

    const data = getResponseData(res);

    const accessToken = data.access_token || data.access || data.token;

    const refreshToken = data.refresh_token || data.refresh;

    if (!accessToken) {
      if (import.meta.env.DEV) console.error("LOGIN RESPONSE:", res.data);
      throw new AuthError("Access token not found in response", { status: res.status });
    }

    if (data.is_active === false) {
      throw new AuthError("Account inactive", { code: "ACCOUNT_INACTIVE" });
    }

    setAccessToken(accessToken);

    if (refreshToken) {
      setRefreshToken(refreshToken);
    }

    // Strip the refresh token out of the persisted user record — it already
    // lives in the dedicated refreshToken key and shouldn't be duplicated.
    const { refresh_token: _refresh_token, refresh: _refresh, ...userData } = data;
    setUser(userData);

    return data;
  } catch (error) {
    throw toAuthError(error);
  }
};

export const logoutMe = async () => {
  try {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      await api.post("/user/v1/logout/", {
        refresh_token: refreshToken,
      });
    }
  } catch (err) {
    if (import.meta.env.DEV) console.warn("Logout API failed:", err?.message);
  } finally {
    clearAuth();
  }
};

const forgotPassword = async (payload) => {
  try {
    const res = await api.post("/user/v1/forgot_password/", payload);
    return getResponseData(res);
  } catch (error) {
    throw toAuthError(error);
  }
};

const sendRegisterEmailOtp = async (payload) => {
  try {
    const res = await api.post("/commonapp/v1/send_otp/", payload);
    const data = getResponseData(res);
    return { ...data, otpSessionKey: extractSessionKey(data) };
  } catch (error) {
    throw toAuthError(error);
  }
};

const verifyEmailOtp = async (payload) => {
  try {
    const res = await api.post("/commonapp/v1/verify_otp/", payload);
    return getResponseData(res);
  } catch (error) {
    throw toAuthError(error);
  }
};

const sendMobileOtp = async (payload) => {
  try {
    const res = await api.post("/commonapp/v1/mobile_send_otp/", payload);
    const data = getResponseData(res);
    return { ...data, otpSessionKey: extractSessionKey(data) };
  } catch (error) {
    throw toAuthError(error);
  }
};

const verifyMobileOtp = async (payload) => {
  try {
    const res = await api.post("/commonapp/v1/mobile_verify_otp/", payload);
    return getResponseData(res);
  } catch (error) {
    throw toAuthError(error);
  }
};

const finalRegister = async (payload) => {
  try {
    const res = await api.post("/user/v1/user_register/", payload);
    return getResponseData(res);
  } catch (error) {
    throw toAuthError(error);
  }
};

export default {
  // auth
  login,
  logoutMe,
  forgotPassword,

  // register + otp
  sendRegisterEmailOtp,
  verifyEmailOtp,
  sendMobileOtp,
  verifyMobileOtp,
  finalRegister,
};
