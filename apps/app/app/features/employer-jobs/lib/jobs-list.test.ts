import { describe, expect, it } from "vitest"

import { jobsPageSchema, type Job } from "../schemas/employer-jobs.schema"
import { bulkTargets, ownStatus } from "./employer-jobs"
import { salaryOf, shortDate } from "./format"

const job = (fields: Partial<Job> = {}): Job => {
  const [parsed] = jobsPageSchema.parse({
    results: [{ id: "1", ...fields }],
  }).results
  if (!parsed) throw new Error("job didn't parse")
  return parsed
}

describe("salaryOf", () => {
  it("prefers the numbers, then reads older text", () => {
    expect(salaryOf(job({ salary_min_lpa: 18, salary_max_lpa: 28 }))).toEqual({
      min: 18,
      max: 28,
    })
    expect(salaryOf(job({ salary_range: "8 - 12 LPA" }))).toEqual({
      min: 8,
      max: 12,
    })
    expect(salaryOf(job({ salary_range: "Up to 10 LPA" }))).toEqual({
      min: null,
      max: 10,
    })
    expect(salaryOf(job())).toBeNull()
  })
})

describe("shortDate", () => {
  const now = new Date("2026-10-22T00:00:00Z")
  it("drops the year when it is this year", () => {
    expect(shortDate("2026-09-20T09:30:00Z", "en-US", now)).toBe("Sep 20")
    expect(shortDate("2025-01-02T09:30:00Z", "en-US", now)).toBe("Jan 2, 2025")
    expect(shortDate("soon", "en-US", now)).toBeNull()
  })
})

describe("ownStatus", () => {
  it("falls back to open", () => {
    expect(ownStatus(job({ status: "PAUSED" }))).toBe("paused")
    expect(ownStatus(job())).toBe("open")
  })
})

describe("bulkTargets", () => {
  const jobs = [
    job({ id: "1", status: "Open", job_status: "approved" }),
    job({ id: "2", status: "Paused", job_status: "approved" }),
    job({ id: "3", status: "Open", job_status: "pending" }),
  ]

  it("offers only statuses that change something", () => {
    expect(bulkTargets(jobs, ["1"]).targets).toEqual(["paused", "closed"])
    expect(bulkTargets(jobs, ["1", "2"]).targets).toEqual([
      "open",
      "paused",
      "closed",
    ])
  })

  it("leaves jobs waiting for approval out", () => {
    const picked = bulkTargets(jobs, ["1", "3"])
    expect(picked.pending).toBe(1)
    expect(picked.movable.map((j) => j.id)).toEqual(["1"])
    expect(bulkTargets(jobs, ["3"]).targets).toEqual([])
  })
})

describe("jobsPageSchema", () => {
  it("drops a broken job instead of emptying the list", () => {
    const page = jobsPageSchema.parse({ results: [{ id: 1 }, { id: {} }] })
    expect(page.results.map((j) => j.id)).toEqual(["1"])
  })
})
