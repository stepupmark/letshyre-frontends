import { afterEach, describe, expect, it, vi } from "vitest";
import { errorKind } from "./errorKind";

const httpError = (status) => ({ response: { status } });

describe("errorKind", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("maps HTTP statuses", () => {
    expect(errorKind(httpError(404))).toBe("notFound");
    expect(errorKind(httpError(403))).toBe("forbidden");
    expect(errorKind(httpError(500))).toBe("generic");
    expect(errorKind(httpError(400))).toBe("generic");
  });

  it("treats a request that never got a response as unreachable", () => {
    expect(errorKind({ code: "ERR_NETWORK", message: "Network Error" })).toBe("unreachable");
  });

  it("reports offline when the browser says so", () => {
    vi.stubGlobal("navigator", { onLine: false });
    expect(errorKind(new Error("timeout"))).toBe("offline");
  });

  it("falls back to generic", () => {
    expect(errorKind(new Error("boom"))).toBe("generic");
    expect(errorKind(undefined)).toBe("generic");
    expect(errorKind({ code: "ECONNABORTED" })).toBe("generic");
  });
});
