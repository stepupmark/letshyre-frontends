import { describe, expect, it } from "vitest"

import { jobSchema, type Job } from "../schemas/employer-jobs.schema"
import { chosenJob, toChoice } from "./job-choice"

const job = (fields: Record<string, unknown>): Job => jobSchema.parse(fields)

describe("chosenJob", () => {
  const open = [job({ id: 101 }), job({ id: 102 })]

  it("keeps a job named in the link, open or not", () => {
    expect(chosenJob("300", open)).toBe("300")
  })

  it("falls back to the first open job for a missing or odd id", () => {
    expect(chosenJob(null, open)).toBe("101")
    expect(chosenJob("../admin", open)).toBe("101")
    expect(chosenJob(null, [])).toBeUndefined()
  })
})

describe("toChoice", () => {
  it("labels an untitled job by its id and adds the place", () => {
    expect(toChoice(job({ id: 7, title: "  ", city: "Pune" }))).toEqual({
      value: "7",
      label: "7",
      place: "Pune",
    })
  })
})
