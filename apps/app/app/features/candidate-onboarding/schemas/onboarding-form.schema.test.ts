import { expect, it } from "vitest"

import { isAadhaar, isAdult } from "./onboarding-form.schema"

it("accepts an Aadhaar number only with a valid check digit", () => {
  expect(isAadhaar("2345 6789 0124")).toBe(true)
  expect(isAadhaar("234567890125")).toBe(false)
  // real numbers never start with 0 or 1
  expect(isAadhaar("123456789012")).toBe(false)
  expect(isAadhaar("23456789012")).toBe(false)
})

it("counts someone as 18 from their birthday, not before", () => {
  const today = new Date(2026, 9, 4)
  expect(isAdult("2008-10-04", today)).toBe(true)
  expect(isAdult("2008-10-05", today)).toBe(false)
  expect(isAdult("", today)).toBe(false)
})
