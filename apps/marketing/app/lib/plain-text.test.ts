import { describe, expect, it } from "vitest"

import { plainText } from "./plain-text"

describe("plainText", () => {
  it("turns line breaks into spaces and drops inline tags", () => {
    expect(plainText("Redefining Hiring with<br/><hl>AI Interviews</hl>")).toBe(
      "Redefining Hiring with AI Interviews"
    )
    expect(plainText("The Challenge<br /><hl>& Our Solution</hl>")).toBe(
      "The Challenge & Our Solution"
    )
  })

  it("leaves plain copy alone", () => {
    expect(plainText("Our Mission")).toBe("Our Mission")
  })
})
