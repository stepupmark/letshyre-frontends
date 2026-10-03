import { describe, expect, it } from "vitest";
import {
  ApiError,
  createErrorResolver,
  extractFieldErrors,
  normalize,
} from "./apiErrorMessages";

describe("normalize", () => {
  it("strips punctuation, case and repeated whitespace", () => {
    expect(normalize("  Invalid   Credentials!! ")).toBe("invalid credentials");
  });

  it("returns undefined for a missing message", () => {
    expect(normalize(undefined)).toBeUndefined();
  });
});

describe("extractFieldErrors", () => {
  it("flattens the DRF array form", () => {
    expect(extractFieldErrors({ email: ["Already taken"] })).toEqual({
      email: "Already taken",
    });
  });

  it("accepts a bare string from a custom serializer", () => {
    expect(extractFieldErrors({ email: "Already taken" })).toEqual({
      email: "Already taken",
    });
  });

  it("drops values it cannot flatten rather than passing an object to a form", () => {
    expect(extractFieldErrors({ email: { nested: true }, otp: ["Wrong"] })).toEqual({
      otp: "Wrong",
    });
  });

  it("returns null when nothing usable is left", () => {
    expect(extractFieldErrors({ email: { nested: true } })).toBeNull();
    expect(extractFieldErrors(["Already taken"])).toBeNull();
    expect(extractFieldErrors(null)).toBeNull();
  });
});

describe("createErrorResolver", () => {
  const resolve = createErrorResolver({
    messages: { "invalid credentials": "errors.invalidCredentials" },
    heuristics: [{ test: (m) => m.includes("otp"), key: "errors.otp" }],
  });
  const opts = { fallback: "errors.fallback" };

  it("reports a missing status as a network failure", () => {
    // An error with no response never reached the server.
    expect(resolve({}, opts)).toBe("errors.network");
    expect(resolve({ status: null }, opts)).toBe("errors.network");
    expect(resolve(undefined, opts)).toBe("errors.network");
  });

  it("maps rate limiting and server faults ahead of any message", () => {
    expect(resolve({ status: 429, backendMessage: "invalid credentials" }, opts)).toBe(
      "errors.tooManyAttempts",
    );
    expect(resolve({ status: 500 }, opts)).toBe("errors.server");
    expect(resolve({ status: 503 }, opts)).toBe("errors.server");
  });

  it("prefers an exact message match over the heuristics", () => {
    expect(resolve({ status: 400, backendMessage: "Invalid Credentials." }, opts)).toBe(
      "errors.invalidCredentials",
    );
  });

  it("falls back to a heuristic when the backend rewords the message", () => {
    expect(resolve({ status: 400, backendMessage: "That OTP looks wrong" }, opts)).toBe(
      "errors.otp",
    );
  });

  it("uses the caller's fallback when nothing matches", () => {
    expect(resolve({ status: 400, backendMessage: "who knows" }, opts)).toBe(
      "errors.fallback",
    );
    expect(resolve({ status: 400 }, opts)).toBe("errors.fallback");
  });
});

describe("ApiError", () => {
  it("carries the fields callers branch on", () => {
    const err = new ApiError("nope", {
      status: 400,
      backendMessage: "Invalid credentials",
      fieldErrors: { email: "taken" },
      code: "BAD",
    });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ApiError");
    expect(err.status).toBe(400);
    expect(err.backendMessage).toBe("Invalid credentials");
    expect(err.fieldErrors).toEqual({ email: "taken" });
    expect(err.code).toBe("BAD");
  });
});
