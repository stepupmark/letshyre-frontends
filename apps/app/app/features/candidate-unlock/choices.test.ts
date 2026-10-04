import { describe, expect, it } from "vitest"

import { costOf, toggle, unlockChoices, type Choice } from "./choices"

const primary = {
  interview_id: "int-primary",
  role: "Backend Engineer",
  score: 82.4,
  unlocked: false,
}
const extra = {
  interview_id: "int-extra",
  role: "Data Engineer",
  score: 71,
  unlocked: false,
}

const at = (choices: Choice[], i: number) => {
  const choice = choices[i]
  if (!choice) throw new Error(`no choice ${String(i)}`)
  return choice
}

// ported from the legacy UnlockProfileModal tests: unlock spends credits
describe("unlock choices", () => {
  it("puts the matched role's interview first, once", () => {
    const choices = unlockChoices([extra, primary, primary], "backend engineer")
    expect(choices.map((c) => [c.id, c.primary])).toEqual([
      ["int-primary", true],
      ["int-extra", false],
    ])
  })

  it("charges one credit per selected interview, and stops when deselected", () => {
    const choices = unlockChoices([primary, extra], "Backend Engineer")
    let selected: ReadonlySet<string> = new Set()
    expect(costOf(selected, choices)).toBe(0)

    selected = toggle(selected, at(choices, 0))
    expect(costOf(selected, choices)).toBe(1)
    selected = toggle(selected, at(choices, 1))
    expect(costOf(selected, choices)).toBe(2)
    selected = toggle(selected, at(choices, 0))
    expect(costOf(selected, choices)).toBe(1)
    expect([...selected]).toEqual(["int-extra"])
  })

  it("never charges again for an interview that is already unlocked", () => {
    const choices = unlockChoices(
      [{ ...primary, unlocked: true }, extra],
      "Backend Engineer"
    )
    const selected = toggle(new Set(), at(choices, 0))
    expect(selected.size).toBe(0)
    expect(costOf(new Set(["int-primary"]), choices)).toBe(0)
  })
})
