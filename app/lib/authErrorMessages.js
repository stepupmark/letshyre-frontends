import { createErrorResolver } from "./apiErrorMessages";

export class AuthError extends Error {
  constructor(message, { status, backendMessage, code } = {}) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.backendMessage = backendMessage;
    this.code = code;
  }
}

const KNOWN_BACKEND_MESSAGES = {
  "invalid credentials": "errors.invalidCredentials",
  "an account with this email already exists": "errors.emailExists",
  "phone number is already registered": "errors.phoneExists",
  "the entered otp is incorrect please try again": "errors.otpIncorrect",
  "incorrect otp please try again": "errors.otpIncorrect",
  "the otp has expired please request a new one": "errors.otpExpired",
  "invalid or unverified otp for email": "errors.otpSessionInvalid",
  "no account found with this email address": "errors.emailNotFound",
};

const HEURISTICS = [
  { test: (m) => m.includes("otp") && m.includes("expired"), key: "errors.otpExpired" },
  { test: (m) => m.includes("otp") && (m.includes("incorrect") || m.includes("invalid")), key: "errors.otpIncorrect" },
  { test: (m) => m.includes("already") && m.includes("email"), key: "errors.emailExists" },
  { test: (m) => m.includes("already") && (m.includes("phone") || m.includes("mobile")), key: "errors.phoneExists" },
  { test: (m) => m.includes("no account") && m.includes("email"), key: "errors.emailNotFound" },
];

export const FIELD_FOR_ERROR_KEY = {
  "errors.emailExists": "email",
  "errors.phoneExists": "mobile",
  "errors.emailNotFound": "email",
};

export function isSessionExpiredKey(key) {
  return key === "errors.otpExpired" || key === "errors.otpSessionInvalid";
}

const resolve = createErrorResolver({ messages: KNOWN_BACKEND_MESSAGES, heuristics: HEURISTICS });

export function resolveAuthErrorKey(error, { fallback = "errors.loginFailed" } = {}) {
  if (error?.code === "ACCOUNT_INACTIVE") return "errors.accountInactive";
  return resolve(error, { fallback });
}

export function resolveLoginErrorKey(error) {
  return resolveAuthErrorKey(error, { fallback: "errors.loginFailed" });
}
