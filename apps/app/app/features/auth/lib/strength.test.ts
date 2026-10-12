import { describe, expect, it } from "vitest"

import { passwordStrength } from "./strength"

describe("passwordStrength", () => {
  it("calls short, common and repeated passwords weak", () => {
    for (const weak of ["short1!", "password123", "Qwerty2024!", "aaaaaaaaaa"])
      expect(passwordStrength(weak)).toBe(1)
  })

  it("rewards variety and length", () => {
    expect(passwordStrength("")).toBe(0)
    expect(passwordStrength("mangotree")).toBe(2)
    expect(passwordStrength("Mango-tree7")).toBe(3)
    expect(passwordStrength("Mango-tree-walk7")).toBe(4)
  })
})
