import { describe, expect, it } from "vitest"

import {
  unlockedPageSchema,
  type Unlocked,
} from "../schemas/candidate-unlock.schema"
import {
  experienceOf,
  initials,
  payOf,
  placeOf,
  roleOf,
  unlockedOn,
} from "./unlocked"

const row = (fields: Partial<Unlocked> = {}): Unlocked => ({
  id: "1",
  candidate_total_experience_years: null,
  candidate_current_ctc: null,
  candidate_expected_ctc: null,
  candidate_notice_period: null,
  ai_overall_score: null,
  ...fields,
})

describe("experienceOf", () => {
  it("keeps under a year from reading as zero", () => {
    expect(experienceOf(0.4)).toBe("under")
    expect(experienceOf(1.6)).toBe(2)
  })

  it("treats missing or zero as unknown", () => {
    expect(experienceOf(null)).toBeNull()
    expect(experienceOf(0)).toBeNull()
  })
})

describe("payOf", () => {
  it("rounds to one decimal and keeps a missing side", () => {
    expect(
      payOf(row({ candidate_current_ctc: 12, candidate_expected_ctc: 16.55 }))
    ).toEqual({ now: "12", next: "16.6" })
    expect(payOf(row({ candidate_expected_ctc: 10 }))).toEqual({
      now: null,
      next: "10",
    })
  })

  it("is null when neither side is known", () => {
    expect(payOf(row())).toBeNull()
  })
})

describe("placeOf", () => {
  it("spaces commas the same way", () => {
    expect(placeOf(row({ candidate_location: "Kondapur,Hyderabad " }))).toBe(
      "Kondapur, Hyderabad"
    )
    expect(placeOf(row({ candidate_location: "  " }))).toBeNull()
  })
})

describe("roleOf", () => {
  it("prefers tech experience, then the latest job", () => {
    expect(roleOf(row({ candidate_tech_experience: { "AI Intern": 1 } }))).toBe(
      "AI Intern"
    )
    expect(roleOf(row({ candidate_experience: [{ role: "QA" }] }))).toBe("QA")
    expect(roleOf(row())).toBeNull()
  })
})

describe("initials", () => {
  it("takes the first two words", () => {
    expect(initials("aadi chetan khot")).toBe("AC")
  })
})

describe("unlockedOn", () => {
  const now = new Date("2026-10-22T00:00:00Z")

  it("drops the year when it is this year", () => {
    expect(
      unlockedOn(row({ unlocked_date: "2026-10-17T10:00:00Z" }), "en-US", now)
    ).toBe("Oct 17")
    expect(
      unlockedOn(row({ unlocked_date: "2025-03-02T10:00:00Z" }), "en-US", now)
    ).toBe("Mar 2, 2025")
  })

  it("is null for a missing or broken date", () => {
    expect(unlockedOn(row({ unlocked_date: "soon" }), "en-US", now)).toBeNull()
  })
})

describe("unlockedPageSchema", () => {
  it("drops a broken row instead of emptying the list", () => {
    const page = unlockedPageSchema.parse({
      data: { results: [{ id: 31 }, { id: { bad: true } }], count: 2 },
    })
    expect(page.results.map((r) => r.id)).toEqual(["31"])
  })
})
