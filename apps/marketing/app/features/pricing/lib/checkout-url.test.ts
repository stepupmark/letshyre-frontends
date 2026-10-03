import { describe, expect, it } from "vitest"

import { APP_LINKS } from "@/lib/app-links"

import { planHref, topUpHref, topUpKey } from "./checkout-url"

describe("planHref", () => {
  it("sends Free to employer sign-up", () => {
    expect(planHref({ id: "free", billing: "free" }, "en")).toEqual({
      href: APP_LINKS.employerRegister,
      internal: false,
    })
  })

  it("sends Custom to sales on this site, in the current language", () => {
    expect(planHref({ id: "custom", billing: "custom" }, "fr")).toEqual({
      href: "/fr/contact?topic=sales",
      internal: true,
    })
  })

  it("checks paid plans out in the app by plan id", () => {
    const { href } = planHref({ id: "pro", billing: "credits" }, "en")
    const url = new URL(href)
    expect(url.pathname).toBe("/employer/billing")
    expect(url.searchParams.get("checkout")).toBe("pro")
  })
})

describe("topUpHref", () => {
  it("uses the <n>-credits key", () => {
    expect(topUpKey(25)).toBe("25-credits")
    expect(new URL(topUpHref(25)).searchParams.get("checkout")).toBe(
      "25-credits"
    )
  })
})
