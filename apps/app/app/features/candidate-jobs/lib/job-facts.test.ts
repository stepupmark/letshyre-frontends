import { describe, expect, test } from "vitest"

import type { Job } from "../schemas/candidate-jobs.schema"
import {
  closingInDays,
  experienceOf,
  isNew,
  salaryOf,
  statusOf,
} from "./job-facts"

const job = (fields: Partial<Job>): Job => ({ id: "1", ...fields })

describe("experienceOf", () => {
  test("prefers the numeric range", () => {
    expect(
      experienceOf(
        job({
          experience_min_years: 2,
          experience_max_years: 5,
          experience_required: "anything",
        }),
        "en"
      )
    ).toBe("2–5")
  })

  test("collapses an equal range and keeps zero for freshers", () => {
    expect(
      experienceOf(
        job({ experience_min_years: 0, experience_max_years: 0 }),
        "en"
      )
    ).toBe("0")
    expect(experienceOf(job({ experience_max_years: 3 }), "en")).toBe("3")
  })

  test("falls back to the text field", () => {
    expect(
      experienceOf(job({ experience_required: "1 - 3 years" }), "en")
    ).toBe("1–3")
    expect(experienceOf(job({}), "en")).toBeNull()
  })
})

describe("salaryOf", () => {
  test("formats lakhs with the locale", () => {
    expect(
      salaryOf(job({ salary_min_lpa: 8.5, salary_max_lpa: 14 }), "en")
    ).toBe("8.5–14")
  })

  test("falls back to the text field without its unit", () => {
    expect(salaryOf(job({ salary_range: "6-10 LPA" }), "en")).toBe("6–10")
    expect(salaryOf(job({ salary_range: " lpa" }), "en")).toBeNull()
  })
})

describe("dates", () => {
  const now = Date.parse("2026-10-22T12:00:00Z")

  test("a job is new for three days", () => {
    expect(isNew(job({ created_at: "2026-10-20T12:00:00Z" }), now)).toBe(true)
    expect(isNew(job({ created_at: "2026-10-18T12:00:00Z" }), now)).toBe(false)
    expect(isNew(job({ created_at: "not a date" }), now)).toBe(false)
  })

  test("counts down only the last week before the deadline", () => {
    expect(closingInDays(job({ deadline: "2026-10-25" }), now)).toBe(3)
    expect(closingInDays(job({ deadline: "2026-11-30" }), now)).toBeNull()
    expect(closingInDays(job({ deadline: "2026-10-01" }), now)).toBeNull()
  })
})

describe("statusOf", () => {
  test("reads any case and treats unknown stages as applied", () => {
    expect(statusOf("shortlisted")).toBe("Shortlisted")
    expect(statusOf("On hold")).toBe("Applied")
    expect(statusOf(null)).toBeNull()
  })
})
