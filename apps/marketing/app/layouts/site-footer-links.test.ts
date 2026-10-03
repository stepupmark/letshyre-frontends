import { describe, expect, it } from "vitest"

import { SITE } from "@/lib/seo/site"

import { socialNetwork } from "./site-footer-links"

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
