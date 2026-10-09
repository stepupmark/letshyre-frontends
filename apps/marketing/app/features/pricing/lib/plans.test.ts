import type { Plan } from "@workspace/api/public"
import { describe, expect, it } from "vitest"

import { mergePlans, PLANS, priceForCredits, sharedRate } from "./plans"

const live = (overrides: Partial<Plan>): Plan => ({
  id: "id",
  slug: "pro",
  name: "Pro",
  credits: 50,
  basePrice: 2450,
  rate: 49,
  planType: "paid_one_time",
  tagline: null,
  highlight: false,
  sortOrder: 1,
  ...overrides,
})

describe("mergePlans", () => {
  const plans = mergePlans([
    live({ id: "f", slug: "free", planType: "free", credits: 0, basePrice: 0 }),
    live({ id: "p" }),
    live({ id: "x", slug: "legacy", planType: "subscription" }),
    live({ id: "n", slug: "starter", name: "Starter", tagline: "New" }),
  ])

  it("keeps known billing types, then appends Custom", () => {
    expect(plans.map((p) => p.id)).toEqual(["free", "pro", "starter", "custom"])
  })

  it("uses local sign-up credits for Free and live prices for paid plans", () => {
    expect(plans[0]).toMatchObject({ billing: "free", credits: 10, price: 0 })
    expect(plans[1]).toMatchObject({ credits: 50, price: 2450, seats: 5 })
  })

  it("keeps API copy for plans the catalog doesn't know", () => {
    expect(plans[2]).toMatchObject({
      name: "Starter",
      tagline: "New",
      seats: null,
    })
  })
})

describe("sharedRate", () => {
  it("returns the rate only when every paid plan shares it", () => {
    expect(sharedRate(mergePlans([live({}), live({ slug: "business" })]))).toBe(
      49
    )
    expect(
      sharedRate(mergePlans([live({}), live({ slug: "business", rate: 45 })]))
    ).toBeNull()
    expect(sharedRate(PLANS)).toBeNull()
  })
})

describe("priceForCredits", () => {
  it("works in paise", () => {
    expect(priceForCredits(3, 2.35)).toBe(7.05)
    expect(priceForCredits(10, 49)).toBe(490)
  })
})
