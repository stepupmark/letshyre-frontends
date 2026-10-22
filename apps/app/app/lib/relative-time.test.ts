import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { relativeTime } from "./relative-time"

describe("relativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-22T12:00:00Z"))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("picks the largest unit that fits", () => {
    expect(relativeTime("2026-10-22T09:00:00Z")).toBe("3 hours ago")
    expect(relativeTime("2026-10-21T12:00:00Z")).toBe("yesterday")
    expect(relativeTime("2026-10-01T12:00:00Z")).toBe("3 weeks ago")
    expect(relativeTime("2026-08-20T12:00:00Z")).toBe("2 months ago")
  })
})
