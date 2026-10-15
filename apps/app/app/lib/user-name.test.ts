import { describe, expect, it } from "vitest"

import { displayName, initials } from "./user-name"

describe("displayName", () => {
  it("prefers the name, then first and last, then the email", () => {
    expect(displayName({ name: " Asha Rao ", email: "a@x.in" })).toBe(
      "Asha Rao"
    )
    expect(
      displayName({ first_name: "Asha", last_name: "", email: "a@x.in" })
    ).toBe("Asha")
    expect(displayName({ first_name: " ", email: "a@x.in" })).toBe("a@x.in")
  })
})

describe("initials", () => {
  it("takes two words from a name but one letter from an email", () => {
    expect(initials("asha rao kumar")).toBe("AR")
    expect(initials("employer@test.in")).toBe("E")
  })
})
