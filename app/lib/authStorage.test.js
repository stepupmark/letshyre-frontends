import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  getUser,
  setAccessToken,
  setRefreshToken,
  setUser,
} from "./authStorage";

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("token round-trip", () => {
  it("reads back what it wrote", () => {
    setAccessToken("access-1");
    setRefreshToken("refresh-1");
    expect(getAccessToken()).toBe("access-1");
    expect(getRefreshToken()).toBe("refresh-1");
  });

  it("returns null for keys that were never written", () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});

describe("getUser", () => {
  it("parses the stored record", () => {
    setUser({ role: "employee", name: "Asha" });
    expect(getUser()).toEqual({ role: "employee", name: "Asha" });
  });

  it("returns an empty object when the record is absent or malformed", () => {
    expect(getUser()).toEqual({});
    localStorage.setItem("user", "{not json");
    expect(getUser()).toEqual({});
  });
});

describe("clearAuth", () => {
  it("removes the auth keys", () => {
    setAccessToken("a");
    setRefreshToken("r");
    setUser({ role: "employer" });
    clearAuth();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(getUser()).toEqual({});
  });

  it("leaves unrelated app storage alone", () => {
    // A blanket localStorage.clear() here used to wipe the onboarding draft.
    localStorage.setItem("employer_onboarding_draft", '{"company_name":"Acme"}');
    localStorage.setItem("locale", "ta");
    setAccessToken("a");
    clearAuth();
    expect(localStorage.getItem("employer_onboarding_draft")).toBe('{"company_name":"Acme"}');
    expect(localStorage.getItem("locale")).toBe("ta");
  });
});

describe("when storage throws", () => {
  // Private browsing and blocked-storage modes throw on access rather than
  // returning null; nothing here may propagate that to a render.
  const boom = () => {
    throw new Error("blocked");
  };

  it("reads return null instead of throwing", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(boom);
    expect(getAccessToken()).toBeNull();
    expect(getUser()).toEqual({});
  });

  it("writes and clears are swallowed", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(boom);
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(boom);
    expect(() => setAccessToken("a")).not.toThrow();
    expect(() => clearAuth()).not.toThrow();
  });
});
