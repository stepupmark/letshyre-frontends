import { describe, expect, it } from "vitest"

import { attentionOf, setupSteps } from "./employer-dashboard"

describe("attentionOf", () => {
  it("is empty for a settled employer", () => {
    expect(attentionOf({ credits: 12, openJobs: 3, closedJobs: 1 })).toEqual([])
  })

  it("warns about credits before jobs", () => {
    expect(attentionOf({ credits: 0, openJobs: 0, closedJobs: 2 })).toEqual([
      "creditsOut",
      "noOpenJobs",
    ])
    expect(attentionOf({ credits: 3, openJobs: 0, closedJobs: 0 })).toEqual([
      "creditsLow",
      "noJobs",
    ])
  })

  it("says nothing about credits until they load", () => {
    expect(
      attentionOf({ credits: undefined, openJobs: 1, closedJobs: 0 })
    ).toEqual([])
  })
})

describe("setupSteps", () => {
  it("marks jobs from what exists", () => {
    const states = (hasJobs: boolean) =>
      setupSteps({ hasJobs }).map((step) => step.state)
    expect(states(true)).toEqual(["done", "done"])
    expect(states(false)).toEqual(["done", "todo"])
  })
})
