import { describe, expect, it } from "vitest"

import { CIN, GSTIN, isLinkedIn, PAN, PIN_CODE } from "./company-ids"

describe("company ids", () => {
  it("accepts well-formed CIN, PAN, GSTIN and PIN codes only", () => {
    expect(CIN.test("U72900TG2024PTC123456")).toBe(true)
    expect(CIN.test("Stepupmark")).toBe(false)
    expect(CIN.test("X72900TG2024PTC123456")).toBe(false)
    expect(PAN.test("ABCDE1234F")).toBe(true)
    expect(PAN.test("ABCDE12345")).toBe(false)
    expect(GSTIN.test("36ABCDE1234F1Z5")).toBe(true)
    expect(GSTIN.test("36ABCDE1234F1X5")).toBe(false)
    expect(PIN_CODE.test("500081")).toBe(true)
    expect(PIN_CODE.test("050081")).toBe(false)
  })

  it("takes linkedin.com and its country hosts, nothing else", () => {
    expect(isLinkedIn("https://in.linkedin.com/company/acme")).toBe(true)
    expect(isLinkedIn("https://linkedin.com.evil.io/company/acme")).toBe(false)
    expect(isLinkedIn("not a url")).toBe(false)
  })
})
