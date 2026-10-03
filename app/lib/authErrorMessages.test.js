import { describe, expect, it } from "vitest";
import {
  AuthError,
  FIELD_FOR_ERROR_KEY,
  isSessionExpiredKey,
  resolveAuthErrorKey,
  resolveLoginErrorKey,
} from "./authErrorMessages";

describe("resolveAuthErrorKey", () => {
  it("short-circuits on the inactive-account code before reading the message", () => {
    expect(
      resolveAuthErrorKey({ code: "ACCOUNT_INACTIVE", status: 500 }),
    ).toBe("errors.accountInactive");
  });

  it.each([
    ["Invalid credentials.", "errors.invalidCredentials"],
    ["An account with this email already exists", "errors.emailExists"],
    ["Phone number is already registered", "errors.phoneExists"],
    ["The entered OTP is incorrect, please try again", "errors.otpIncorrect"],
    ["The OTP has expired, please request a new one", "errors.otpExpired"],
    ["Invalid or unverified OTP for email", "errors.otpSessionInvalid"],
    ["No account found with this email address", "errors.emailNotFound"],
  ])("maps the known backend message %j", (backendMessage, key) => {
    expect(resolveAuthErrorKey({ status: 400, backendMessage })).toBe(key);
  });

  it.each([
    ["Your otp has expired already", "errors.otpExpired"],
    ["that otp is invalid", "errors.otpIncorrect"],
    ["This email is already in use", "errors.emailExists"],
    ["That mobile is already taken", "errors.phoneExists"],
    ["We found no account for that email", "errors.emailNotFound"],
  ])("still maps %j once the backend rewords it", (backendMessage, key) => {
    expect(resolveAuthErrorKey({ status: 400, backendMessage })).toBe(key);
  });

  it("defaults to a login failure, and honours an override", () => {
    expect(resolveAuthErrorKey({ status: 400 })).toBe("errors.loginFailed");
    expect(
      resolveAuthErrorKey({ status: 400 }, { fallback: "toast.registerFailed" }),
    ).toBe("toast.registerFailed");
  });

  it("reports an unreachable server as a network failure", () => {
    expect(resolveAuthErrorKey({})).toBe("errors.network");
  });
});

describe("resolveLoginErrorKey", () => {
  it("is resolveAuthErrorKey with the login fallback", () => {
    expect(resolveLoginErrorKey({ status: 400 })).toBe("errors.loginFailed");
    expect(resolveLoginErrorKey({ status: 429 })).toBe("errors.tooManyAttempts");
  });
});

describe("FIELD_FOR_ERROR_KEY", () => {
  // Keys listed here are shown under a field instead of a toast, so a typo
  // silently sends the message nowhere.
  it("points the duplicate/unknown-account errors at a real field", () => {
    expect(FIELD_FOR_ERROR_KEY["errors.emailExists"]).toBe("email");
    expect(FIELD_FOR_ERROR_KEY["errors.phoneExists"]).toBe("mobile");
    expect(FIELD_FOR_ERROR_KEY["errors.emailNotFound"]).toBe("email");
  });

  it("leaves errors with no field to a toast", () => {
    expect(FIELD_FOR_ERROR_KEY["errors.invalidCredentials"]).toBeUndefined();
    expect(FIELD_FOR_ERROR_KEY["errors.network"]).toBeUndefined();
  });
});

describe("isSessionExpiredKey", () => {
  it("covers both ways an OTP session dies", () => {
    expect(isSessionExpiredKey("errors.otpExpired")).toBe(true);
    expect(isSessionExpiredKey("errors.otpSessionInvalid")).toBe(true);
  });

  it("leaves a merely wrong OTP on the same step", () => {
    expect(isSessionExpiredKey("errors.otpIncorrect")).toBe(false);
  });
});

describe("AuthError", () => {
  it("carries the fields callers branch on", () => {
    const err = new AuthError("nope", {
      status: 403,
      backendMessage: "Account inactive",
      code: "ACCOUNT_INACTIVE",
    });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("AuthError");
    expect(err.status).toBe(403);
    expect(err.code).toBe("ACCOUNT_INACTIVE");
  });
});
