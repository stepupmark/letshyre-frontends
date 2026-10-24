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
  it("joins first and last names when there is no full name", () => {
    expect(
      accountOf({
        first_name: "Neha",
        last_name: " Kapoor ",
        email: "neha@acme.test",
      })
    ).toEqual({ name: "Neha Kapoor", email: "neha@acme.test", phone: null })
  })
})

describe("companySchema", () => {
  it("reads the profile in the shape the API sends", () => {
    const company = companySchema.parse({
      id: "f75db61e",
      user: "f6b4e989-32a1-47d3-ada8-5898587bc17b",
      is_verified: false,
      open_jobs_posted: 3,
      total_jobs_posted: "5",
      kyc: {
        company_name: "Acme Labs",
        kyc_status: "Verified",
        reference: null,
      },
    })
    expect(company.kyc?.company_name).toBe("Acme Labs")
    expect(company.total_jobs_posted).toBe(5)
  })

  it("empties an odd field instead of failing the page", () => {
    const company = companySchema.parse({ kyc: { company_name: 42 } })
    expect(company.kyc?.company_name).toBeNull()
    expect(companySchema.parse({ kyc: [] }).kyc).toBeNull()
  })
})

describe("masked", () => {
  it("keeps only the last four characters", () => {
    expect(masked("ABCDE1234F")).toBe("•••• 234F")
    expect(masked("12")).toBe("12")
  })
})
