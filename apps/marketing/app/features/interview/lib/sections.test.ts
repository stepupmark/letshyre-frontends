import { describe, expect, it } from "vitest"

import interview from "@/locales/en/interview.json"

import { REQUIREMENTS, STEPS, stepAnchor, tipFor } from "./sections"

describe("interview sections", () => {
  it("has the eight steps, each with copy", () => {
    expect(STEPS).toHaveLength(8)
    for (const id of STEPS) {
      expect(interview.steps[id].title).toBeTruthy()
      expect(interview.steps[id].desc).toBeTruthy()
    }
  })

  it("only returns tips that exist in the catalog", () => {
    const withTips = STEPS.filter((id) => tipFor(id))
    expect(withTips).toEqual(["clearEnv", "verifyId"])
    for (const id of withTips) {
      expect(Object.keys(interview.steps[id])).toContain("tip")
    }
  })

  it("has copy for every requirement", () => {
    for (const id of REQUIREMENTS) {
      expect(interview.requirements.items[id].title).toBeTruthy()
    }
  })

  it("builds unique anchors", () => {
    expect(new Set(STEPS.map(stepAnchor)).size).toBe(STEPS.length)
  })
})
