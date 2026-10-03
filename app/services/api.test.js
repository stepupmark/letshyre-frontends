import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import api from "./api";
import { clearAuth, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from "@/lib/authStorage";

// A fake network in place of the HTTP adapter, so the real interceptor chain
// (queueing, retry, token rotation) is what's under test.
let handler;
const ok = (config, data = {}) => ({ status: 200, data, config, headers: {} });
const unauthorized = (config) =>
  Promise.reject(
    Object.assign(new Error("401"), { config, response: { status: 401, data: {}, config, headers: {} } }),
  );

beforeEach(() => {
  localStorage.clear();
  handler = vi.fn();
  const adapter = (config) => Promise.resolve(handler(config));
  api.defaults.adapter = adapter;
  axios.defaults.adapter = adapter;
  // window.location is read-only in jsdom; the refresh failure path assigns it.
  delete window.location;
  window.location = { href: "" };
  // The refresh path logs the failure in DEV; the expected ones are noise here.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe("request interceptor", () => {
  it("attaches the bearer token", async () => {
    setAccessToken("access-1");
    handler.mockImplementation((c) => ok(c));
    await api.get("/user/v1/me/");
    expect(handler.mock.calls[0][0].headers.Authorization).toBe("Bearer access-1");
  });

  it("leaves public endpoints unauthenticated", async () => {
    setAccessToken("access-1");
    handler.mockImplementation((c) => ok(c));
    await api.post("/user/v1/login/", {});
    expect(handler.mock.calls[0][0].headers.Authorization).toBeUndefined();
  });
});

describe("401 refresh", () => {
  it("refreshes once, then retries the original request", async () => {
    setAccessToken("stale");
    setRefreshToken("refresh-1");
    let refreshed = false;
    handler.mockImplementation((c) => {
      if (c.url.includes("login_refresh")) {
        refreshed = true;
        return ok(c, { access_token: "fresh" });
      }
      if (!refreshed) return unauthorized(c);
      return ok(c, { me: true });
    });

    const res = await api.get("/user/v1/me/");
    expect(res.data).toEqual({ me: true });
    expect(getAccessToken()).toBe("fresh");
  });

  it("persists a rotated refresh token", async () => {
    // Simple JWT blacklists the old one, so dropping this breaks the next refresh.
    setRefreshToken("refresh-1");
    let refreshed = false;
    handler.mockImplementation((c) => {
      if (c.url.includes("login_refresh")) {
        refreshed = true;
        return ok(c, { access_token: "fresh", refresh_token: "refresh-2" });
      }
      return refreshed ? ok(c) : unauthorized(c);
    });

    await api.get("/user/v1/me/");
    expect(getRefreshToken()).toBe("refresh-2");
  });

  it("refreshes once for several concurrent 401s", async () => {
    setRefreshToken("refresh-1");
    let refreshed = false;
    let refreshCalls = 0;
    handler.mockImplementation((c) => {
      if (c.url.includes("login_refresh")) {
        refreshCalls += 1;
        refreshed = true;
        return new Promise((r) => setTimeout(() => r(ok(c, { access_token: "fresh" })), 10));
      }
      return refreshed ? ok(c) : unauthorized(c);
    });

    await Promise.all([api.get("/a/"), api.get("/b/"), api.get("/c/")]);
    expect(refreshCalls).toBe(1);
  });

  it("does not try to refresh a failed login", async () => {
    handler.mockImplementation((c) => unauthorized(c));
    await expect(api.post("/user/v1/login/", {})).rejects.toThrow();
    expect(handler.mock.calls.every((c) => !c[0].url.includes("login_refresh"))).toBe(true);
  });

  it("clears auth and sends the visitor to their own locale on failure", async () => {
    localStorage.setItem("locale", "ar");
    setAccessToken("stale");
    setRefreshToken("refresh-1");
    handler.mockImplementation((c) =>
      c.url.includes("login_refresh")
        ? Promise.reject(new Error("refresh rejected"))
        : unauthorized(c),
    );

    await expect(api.get("/user/v1/me/")).rejects.toThrow();
    expect(getAccessToken()).toBeNull();
    expect(window.location.href).toBe("/ar");
  });

  it("gives up when there is no refresh token", async () => {
    clearAuth();
    handler.mockImplementation((c) => unauthorized(c));
    await expect(api.get("/user/v1/me/")).rejects.toThrow();
    expect(handler.mock.calls.every((c) => !c[0].url.includes("login_refresh"))).toBe(true);
  });

  it("bounds the refresh request with a timeout", async () => {
    // Without one, a refresh that never answers strands every queued request.
    setRefreshToken("refresh-1");
    handler.mockImplementation((c) =>
      c.url.includes("login_refresh") ? ok(c, { access_token: "fresh" }) : unauthorized(c),
    );

    await api.get("/user/v1/me/").catch(() => {});
    const refresh = handler.mock.calls.find((c) => c[0].url.includes("login_refresh"))[0];
    expect(refresh.timeout).toBeGreaterThan(0);
  });
});

describe("authOptional requests", () => {
  it("lets a guest's 401 through without refreshing or redirecting", async () => {
    clearAuth();
    handler.mockImplementation((c) => unauthorized(c));

    await expect(api.get("/payment/v1/employer/calculate-token-cost/", { authOptional: true })).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(handler.mock.calls.every((c) => !c[0].url.includes("login_refresh"))).toBe(true);
    expect(window.location.href).toBe("");
  });

  it("still refreshes a signed-in session", async () => {
    setAccessToken("stale");
    setRefreshToken("refresh-1");
    let refreshed = false;
    handler.mockImplementation((c) => {
      if (c.url.includes("login_refresh")) {
        refreshed = true;
        return ok(c, { access_token: "fresh" });
      }
      return refreshed ? ok(c, { price: 2 }) : unauthorized(c);
    });

    const res = await api.get("/payment/v1/employer/calculate-token-cost/", { authOptional: true });
    expect(res.data).toEqual({ price: 2 });
  });

  it("clears a dead session but stays on the page", async () => {
    setAccessToken("stale");
    setRefreshToken("refresh-1");
    handler.mockImplementation((c) =>
      c.url.includes("login_refresh") ? Promise.reject(new Error("refresh rejected")) : unauthorized(c),
    );

    await expect(api.get("/payment/v1/employer/calculate-token-cost/", { authOptional: true })).rejects.toThrow();
    expect(getAccessToken()).toBeNull();
    expect(window.location.href).toBe("");
  });
});
