import { afterEach, describe, expect, it, vi } from "vitest";

const args = (path) => ({ request: new Request(`https://letshyre.ai${path}`) });

describe("handOffLiveRoutes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("lets the first page through, then hands live routes to the new app", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(["^/employer/?$"])),
    );
    const { handOffLiveRoutes } = await import("./liveRoutes");
    const next = vi.fn(async () => "rendered");

    await expect(handOffLiveRoutes(args("/employer"), next)).resolves.toBe("rendered");
    await expect(handOffLiveRoutes(args("/employer/post-job"), next)).resolves.toBe("rendered");

    const thrown = await handOffLiveRoutes(args("/employer?tab=1"), next).catch((e) => e);
    expect(thrown).toBeInstanceOf(Response);
    expect(thrown.headers.get("Location")).toBe("/employer?tab=1");
    expect(thrown.headers.get("X-Remix-Reload-Document")).toBe("true");
  });

  it("keeps working when the list can't be fetched", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    const { handOffLiveRoutes } = await import("./liveRoutes");
    const next = vi.fn(async () => "rendered");

    await handOffLiveRoutes(args("/employer"), next);
    await expect(handOffLiveRoutes(args("/employer"), next)).resolves.toBe("rendered");
  });
});
