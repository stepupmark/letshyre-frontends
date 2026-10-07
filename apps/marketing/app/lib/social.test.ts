import { describe, expect, it } from "vitest"

import { SITE } from "./seo/site"
import { socialNetwork } from "./social"

describe("socialNetwork", () => {
  it("recognises every profile the site lists", () => {
    expect(SITE.sameAs.map(socialNetwork)).toEqual([
      "linkedin",
      "x",
      "instagram",
      "youtube",
    ])
  })

  it("ignores www and unknown hosts", () => {
    expect(socialNetwork("https://twitter.com/letshyre")).toBe("x")
    expect(socialNetwork("https://example.com")).toBeNull()
  })
})
