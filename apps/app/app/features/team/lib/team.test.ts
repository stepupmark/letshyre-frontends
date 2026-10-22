import { describe, expect, it } from "vitest"

import { membersSchema, type Member } from "../schemas/team.schema"
import { generatePassword, initials, isActive, nameOf } from "./team"

const member = (fields: Partial<Member> = {}): Member => ({
  id: "1",
  ...fields,
})

describe("generatePassword", () => {
  it("is 14 characters with no look-alikes", () => {
    for (let i = 0; i < 50; i++) {
      const password = generatePassword()
      expect(password).toHaveLength(14)
      expect(password).toMatch(/^[a-km-zA-HJ-NP-Z2-9]+$/)
    }
  })
})

describe("nameOf", () => {
  it("falls back to the email, then nothing", () => {
    expect(nameOf(member({ full_name: " Meera Iyer " }))).toBe("Meera Iyer")
    expect(nameOf(member({ full_name: "", email: "m@acme.test" }))).toBe(
      "m@acme.test"
    )
    expect(nameOf(member())).toBeNull()
  })
})

describe("isActive", () => {
  it("treats a missing status as active and ignores case", () => {
    expect(isActive(member())).toBe(true)
    expect(isActive(member({ status: "HOLD" }))).toBe(false)
  })
})

describe("initials", () => {
  it("takes the first two words", () => {
    expect(initials("rahul kumar verma")).toBe("RK")
  })
})

describe("membersSchema", () => {
  it("drops a broken row instead of emptying the team", () => {
    const team = membersSchema.parse({
      data: { results: [{ id: 11 }, { id: null }] },
    })
    expect(team.results.map((m) => m.id)).toEqual(["11"])
  })
})
