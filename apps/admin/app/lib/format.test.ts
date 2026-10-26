import { expect, it } from "vitest"

import { formatCurrency, formatNumber, maskId, percentChange } from "./format"

it("shows only the last characters of an identifier", () => {
  expect(maskId("1234 5678 9012")).toBe("••••••••9012")
  expect(maskId("ABCDE1234F", 2)).toBe("••••••••4F")
  expect(maskId("123")).toBe("123")
  expect(maskId("  ")).toBe("—")
  expect(maskId(null)).toBe("—")
})

it("formats rupees, other currencies and missing amounts", () => {
  expect(formatCurrency(149900)).toBe("₹1,49,900.00")
  expect(formatCurrency("499.5")).toBe("₹499.50")
  expect(formatCurrency(10, "USD")).toBe("$10.00")
  expect(formatCurrency(10, "NOT-A-CODE")).toBe("NOT-A-CODE 10")
  for (const missing of [null, undefined, "", "abc"])
    expect(formatCurrency(missing)).toBe("—")
})

it("formats counts in the Indian system", () => {
  expect(formatNumber(1234567)).toBe("12,34,567")
  expect(formatNumber("0")).toBe("0")
  expect(formatNumber(null)).toBe("—")
})

it("has no percentage change from zero", () => {
  expect(percentChange(150, 100)).toBe(50)
  expect(percentChange(5, 0)).toBeNull()
})
