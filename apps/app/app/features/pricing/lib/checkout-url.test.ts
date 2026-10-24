import { describe, expect, it } from "vitest"

import { planHref, topUpHref } from "./checkout-url"

describe("planHref", () => {
  it("sends Free to employer sign-up", () => {
    expect(planHref({ id: "free", billing: "free" }, "en")).toBe(
      "/employer/register"
    )
  })

  it("sends Custom to sales on the marketing site, in the current language", () => {
    const url = new URL(planHref({ id: "custom", billing: "custom" }, "fr"))
    expect(url.pathname).toBe("/fr/contact")
    expect(url.searchParams.get("topic")).toBe("sales")
  })

  it("checks paid plans and top-ups out in billing", () => {
    expect(planHref({ id: "pro", billing: "credits" }, "en")).toBe(
      "/employer/billing?checkout=pro"
    )
    expect(topUpHref(25)).toBe("/employer/billing?checkout=25-credits")
  })
})
