import { describe, expect, it } from "vitest"

import { neighbours } from "./nav"

describe("neighbours", () => {
  const keys = ["a", "b", "c"]

  it("finds both sides of a middle row", () => {
    expect(neighbours(keys, "b")).toEqual({
      index: 1,
      previous: "a",
      next: "c",
    })
  })

  it("stops at the ends of the page", () => {
    expect(neighbours(keys, "a")).toMatchObject({ previous: null, next: "b" })
    expect(neighbours(keys, "c")).toMatchObject({ previous: "b", next: null })
    expect(neighbours(["a"], "a")).toMatchObject({ previous: null, next: null })
  })

  it("returns nothing when the selected row isn't on this page", () => {
    expect(neighbours(keys, "z")).toBeNull()
    expect(neighbours(keys, null)).toBeNull()
    expect(neighbours([], "a")).toBeNull()
  })
})
