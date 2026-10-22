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
  const state = (review: "pending" | "verified" | "rejected" | undefined) =>
    setupSteps({ hasJobs: true, hasTeam: false, review }).find(
      (step) => step.key === "company"
    )?.state

  it("follows the company review instead of assuming it's done", () => {
    expect(state("verified")).toBe("done")
    expect(state("pending")).toBe("waiting")
    expect(state("rejected")).toBe("fix")
    expect(state(undefined)).toBe("waiting")
  })

  it("marks jobs and team from what exists", () => {
    const steps = setupSteps({
      hasJobs: true,
      hasTeam: false,
      review: "verified",
    })
    expect(steps.map((step) => step.state)).toEqual([
      "done",
      "done",
      "done",
      "todo",
    ])
  })
})
