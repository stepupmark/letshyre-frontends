import { afterEach, describe, expect, it, vi } from "vitest";
import { errorKind } from "./errorKind";

describe("errorKind", () => {
  afterEach(() => vi.restoreAllMocks());

  it("spots a stale chunk after a deploy", () => {
    expect(errorKind(new TypeError("Failed to fetch dynamically imported module: /assets/x.js"))).toBe("update");
    expect(errorKind(new TypeError("Importing a module script failed."))).toBe("update");
  });

  it("reports offline before anything else", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    expect(errorKind(new TypeError("Failed to fetch dynamically imported module"))).toBe("offline");
  });

  it("falls back to generic", () => {
    expect(errorKind(new Error("boom"))).toBe("generic");
    expect(errorKind(undefined)).toBe("generic");
  });
});
