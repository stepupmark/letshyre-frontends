import { describe, expect, it } from "vitest"

import { compareIds, leaders } from "./compare"

describe("compareIds", () => {
  it("drops bad and repeated ids and caps the list", () => {
    expect(compareIds("a, b,a,../x,c,d")).toEqual(["a", "b", "c"])
    expect(compareIds(null)).toEqual([])
  })
})

describe("leaders", () => {
  it("highlights every tied top score", () => {
    expect(leaders([70, 82, 82])).toEqual(new Set([1, 2]))
  })

  it("highlights nobody when there's nothing to beat", () => {
    expect(leaders([60, 60])).toEqual(new Set())
    expect(leaders([90, null, undefined])).toEqual(new Set())
  })
})
