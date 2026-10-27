import { describe, expect, it } from "vitest"

import { readFilters, writeFilters } from "./filters"

const read = (query: string) => readFilters(new URLSearchParams(query))

describe("readFilters", () => {
  it("splits skills on commas, trims them and drops repeats in any case", () => {
    expect(read("skills=Git, python,,GIT").skills).toEqual(["Git", "python"])
  })

  it("ignores years that aren't whole numbers in range", () => {
    expect(read("experience_min=-1&experience_max=abc")).toMatchObject({
      min: null,
      max: null,
    })
    expect(read("experience_min=2.5&experience_max=99")).toMatchObject({
      min: null,
      max: null,
    })
  })

  it("swaps a hand-edited range that runs backwards", () => {
    expect(read("experience_min=5&experience_max=2")).toMatchObject({
      min: 2,
      max: 5,
    })
  })
})

describe("writeFilters", () => {
  it("drops empty filters and goes back to page 1", () => {
    const next = writeFilters(new URLSearchParams("page=3&skills=Git"), {
      skills: [],
      min: 3,
      max: null,
    })
    expect(next.toString()).toBe("experience_min=3")
  })
})
