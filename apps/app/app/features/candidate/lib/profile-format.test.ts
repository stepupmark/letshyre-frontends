import { describe, expect, it } from "vitest"

import { addressOf, lpaOf, noticeOf, phoneOf } from "./profile-format"

describe("profile formatting", () => {
  it("adds India's code only to bare numbers", () => {
    expect(phoneOf(9876543210)).toBe("+91 9876543210")
    expect(phoneOf("+44 7700 900123")).toBe("+44 7700 900123")
    expect(phoneOf(" ")).toBeNull()
  })

  it("keeps pay to the two decimals the form accepts", () => {
    expect(lpaOf(12)).toBe("12")
    expect(lpaOf(16.5)).toBe("16.5")
    expect(lpaOf(12.345)).toBe("12.35")
  })

  it("reads notice as days, now, or the candidate's own words", () => {
    expect(noticeOf("30")).toEqual({ kind: "days", days: 30 })
    expect(noticeOf(0)).toEqual({ kind: "now" })
    expect(noticeOf("Serving notice")).toEqual({
      kind: "text",
      text: "Serving notice",
    })
    expect(noticeOf(null)).toEqual({ kind: "unknown" })
  })

  it("joins an address stored as parts, once each", () => {
    expect(addressOf({ line: "12 Marine Drive", city: "Kochi", pin: 1 })).toBe(
      "12 Marine Drive, Kochi"
    )
    expect(
      addressOf({ city: "Hyderabad, India", state: "Hyderabad, India" })
    ).toBe("Hyderabad, India")
    expect(addressOf("  ")).toBeNull()
  })
})
