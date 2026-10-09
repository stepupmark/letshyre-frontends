import { describe, expect, it } from "vitest"

import { priceStatus } from "./price-status"

const base = {
  hasData: false,
  isPending: true,
  fetchStatus: "fetching" as const,
  slow: false,
  online: true,
}

describe("priceStatus", () => {
  it("is ready whenever there is data, even if a refresh failed", () => {
    expect(priceStatus({ ...base, hasData: true, isPending: false })).toBe(
      "ready"
    )
  })

  it("is loading, then slow, while the first fetch runs", () => {
    expect(priceStatus(base)).toBe("loading")
    expect(priceStatus({ ...base, fetchStatus: "idle" })).toBe("loading")
    expect(priceStatus({ ...base, slow: true })).toBe("slow")
  })

  it("tells offline apart from a failed request", () => {
    expect(priceStatus({ ...base, fetchStatus: "paused" })).toBe("offline")
    expect(priceStatus({ ...base, isPending: false })).toBe("error")
    expect(priceStatus({ ...base, isPending: false, online: false })).toBe(
      "offline"
    )
  })
})
