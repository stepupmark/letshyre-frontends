import { describe, expect, it } from "vitest"

import { readParams, writeParams } from "./params"

const read = (query: string) => readParams(new URLSearchParams(query))

describe("readParams", () => {
  it("ignores hand-edited values the API would reject", () => {
    expect(read("q=  dev   ops &page=-2&experience_max=99")).toMatchObject({
      search: "dev ops",
      page: 1,
      max: null,
    })
  })

  it("swaps a range that runs backwards", () => {
    expect(read("experience_min=6&experience_max=3")).toMatchObject({
      min: 3,
      max: 6,
    })
  })
})

describe("writeParams", () => {
  it("goes back to page 1 on a new search and drops empty filters", () => {
    const url = new URLSearchParams("q=devops&page=3&location=Pune")
    expect(writeParams(url, { search: "react", location: "" }).toString()).toBe(
      "q=react"
    )
  })

  it("keeps the search and filters when turning a page", () => {
    const url = new URLSearchParams("q=devops&education=B.Tech")
    expect(writeParams(url, { page: 2 }).toString()).toBe(
      "q=devops&education=B.Tech&page=2"
    )
  })
})
