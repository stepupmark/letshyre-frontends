import { describe, expect, test } from "vitest"

import {
  matchesApplication,
  readView,
  stepsOf,
  writeView,
} from "./applications"

const read = (query: string) => readView(new URLSearchParams(query))

describe("readView", () => {
  test("defaults to the Applied stage on page 1", () => {
    expect(read("")).toEqual({ stage: "Applied", page: 1, q: "" })
  })

  test("reads any case and ignores unknown stages and bad pages", () => {
    expect(read("status=SHORTLISTED&page=3").stage).toBe("Shortlisted")
    expect(read("status=hired&page=-2")).toEqual({
      stage: "Applied",
      page: 1,
      q: "",
    })
  })

  test("writes back without defaults and keeps other params", () => {
    const next = writeView(
      { stage: "Applied", page: 1, q: "" },
      new URLSearchParams("status=rejected&page=2&job=9")
    )
    expect(next.toString()).toBe("job=9")
    expect(
      writeView(
        read("status=selected&page=2&q=pay"),
        new URLSearchParams()
      ).toString()
    ).toBe("status=selected&page=2&q=pay")
  })
})

describe("stepsOf", () => {
  test("marks the steps before the stage done and the rest to do", () => {
    expect(stepsOf("Shortlisted").map((step) => step.state)).toEqual([
      "done",
      "now",
      "todo",
    ])
  })

  test("stops a rejection after Applied", () => {
    expect(stepsOf("Rejected")).toEqual([
      { stage: "Applied", state: "done" },
      { stage: "Rejected", state: "stopped" },
    ])
  })
})

describe("matchesApplication", () => {
  test("matches the title or the company", () => {
    const job = { id: "1", title: "UI Engineer", company_name: "Kestrel Pay" }
    expect(matchesApplication(job, "kestrel")).toBe(true)
    expect(matchesApplication(job, "engineer")).toBe(true)
    expect(matchesApplication(job, "finch")).toBe(false)
    expect(matchesApplication(job, "")).toBe(true)
  })
})
