import { describe, expect, it } from "vitest"

import { companySchema } from "../schemas/company-profile.schema"
import { accountOf, masked, verificationOf } from "./company"

describe("verificationOf", () => {
  it("reads the review states the API sends", () => {
    expect(verificationOf("Approved")).toBe("verified")
    expect(verificationOf("verified")).toBe("verified")
    expect(verificationOf("REJECTED")).toBe("rejected")
    expect(verificationOf("submitted")).toBe("pending")
    expect(verificationOf(" ")).toBeNull()
    expect(verificationOf(null)).toBeNull()
  })
})

describe("accountOf", () => {
  it("falls back to the nested user when the top level is empty", () => {
    const company = companySchema.parse({
      name: "",
      user: { user_name: "Neha", email: "neha@acme.test" },
    })
    expect(accountOf(company)).toEqual({
      name: "Neha",
      email: "neha@acme.test",
      phone: null,
    })
  })
})

describe("masked", () => {
  it("keeps only the last four characters", () => {
    expect(masked("ABCDE1234F")).toBe("•••• 234F")
    expect(masked("12")).toBe("12")
  })
})
