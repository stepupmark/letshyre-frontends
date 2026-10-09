import { describe, expect, it } from "vitest"

import { formatCurrency, formatNumber } from "../src/format.ts"

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
})
