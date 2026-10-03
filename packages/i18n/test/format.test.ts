import { describe, expect, it } from "vitest"

import {
  formatCurrency,
  formatDate,
  formatList,
  formatNumber,
  formatRelative,
} from "../src/format.ts"

describe("formatters", () => {
  it("formats numbers and INR by locale", () => {
    expect(formatNumber("en", 1234567.5)).toBe("1,234,567.5")
    expect(formatNumber("hi", 1234567)).toBe("12,34,567")
    expect(formatCurrency("en", 499)).toBe("₹499.00")
    expect(formatCurrency("en", 499, "INR", { maximumFractionDigits: 0 })).toBe(
      "₹499"
    )
    expect(formatCurrency("de", 10, "EUR")).toBe("10,00 €")
  })

  it("formats dates and rejects invalid ones", () => {
    expect(
      formatDate("en", "2026-03-05T00:00:00Z", {
        dateStyle: "medium",
        timeZone: "UTC",
      })
    ).toBe("Mar 5, 2026")
    expect(formatDate("en", new Date("2026-03-05T12:00:00Z"))).toMatch(/2026/)
    expect(formatDate("en", "not a date")).toBeNull()
  })

  it("picks the largest whole unit for relative time", () => {
    const now = "2026-03-10T12:00:00Z"
    expect(formatRelative("en", "2026-03-07T12:00:00Z", now)).toBe("3 days ago")
    expect(formatRelative("en", "2026-03-10T14:00:00Z", now)).toBe("in 2 hours")
    expect(formatRelative("en", "2026-03-09T12:00:00Z", now)).toBe("yesterday")
    expect(formatRelative("en", now, now)).toBe("now")
    expect(formatRelative("en", "bad", now)).toBeNull()
  })

  it("joins lists the locale's way", () => {
    expect(formatList("en", ["Apply", "Interview", "Offer"])).toBe(
      "Apply, Interview, and Offer"
    )
    expect(formatList("en", ["a", "b"], { type: "disjunction" })).toBe("a or b")
  })
})
