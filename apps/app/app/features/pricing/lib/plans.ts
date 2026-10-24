import type { Plan } from "@workspace/api/public"

type Billing = "free" | "credits" | "custom"

export interface PricingPlan {
  /** The plan slug, also the `?checkout=` key in billing. */
  id: string
  billing: Billing
  credits: number | null
  seats: number | null
  topUps: boolean
  support: boolean
  featured: boolean
  /** `null` until live prices load, and always for Custom. */
  price: number | null
  rate: number | null
  /** From the API, used when the catalog has no copy for this plan. */
  name: string | null
  tagline: string | null
}

const KNOWN_PLANS = ["free", "pro", "business", "custom"] as const
export type KnownPlan = (typeof KNOWN_PLANS)[number]

export const isKnownPlan = (id: string): id is KnownPlan =>
  KNOWN_PLANS.some((known) => known === id)

const plan = (
  values: Pick<PricingPlan, "id" | "billing" | "credits" | "seats"> &
    Partial<PricingPlan>
): PricingPlan => ({
  topUps: true,
  support: false,
  featured: false,
  price: null,
  rate: null,
  name: null,
  tagline: null,
  ...values,
})

// what each plan includes beyond the API; shown until live plans load
export const PLANS: PricingPlan[] = [
  plan({
    id: "free",
    billing: "free",
    credits: 10,
    seats: 1,
    topUps: false,
    price: 0,
  }),
  plan({ id: "pro", billing: "credits", credits: 50, seats: 5 }),
  plan({
    id: "business",
    billing: "credits",
    credits: 100,
    seats: 25,
    featured: true,
  }),
  plan({
    id: "custom",
    billing: "custom",
    credits: null,
    seats: null,
    support: true,
  }),
]

export const TOP_UPS = [10, 25, 50, 100] as const

export const COMPARISON_ROWS = [
  "credits",
  "profiles",
  "scorecards",
  "recordings",
  "seats",
  "topUps",
  "validity",
  "support",
] as const

export type ComparisonRow = (typeof COMPARISON_ROWS)[number]

/** `true`/`false` render as included or not, `null` as "Custom". */
export type ComparisonValue = number | boolean | null | "noExpiry"

export function comparisonValue(
  row: ComparisonRow,
  plan: PricingPlan
): ComparisonValue {
  switch (row) {
    case "credits":
      return plan.credits
    case "seats":
      return plan.seats
    case "topUps":
      return plan.topUps
    case "support":
      return plan.support
    case "validity":
      return "noExpiry"
    case "profiles":
    case "scorecards":
    case "recordings":
      return true
  }
}

const LOCAL = new Map(PLANS.map((p) => [p.id, p]))
const BILLING: Partial<Record<string, Billing>> = {
  free: "free",
  paid_one_time: "credits",
}

/** Live plans in API order, with local details filled in, then Custom. */
export function mergePlans(live: readonly Plan[]): PricingPlan[] {
  const plans = live.flatMap((item) => {
    const billing = BILLING[item.planType]
    if (!billing) return []
    const local = LOCAL.get(item.slug)
    return [
      plan({
        id: item.slug,
        billing,
        // sign-up credits aren't in the API, which only counts purchased ones
        credits:
          billing === "free" ? (local?.credits ?? item.credits) : item.credits,
        seats: local?.seats ?? null,
        topUps: local?.topUps ?? true,
        featured: item.highlight,
        price: item.basePrice,
        rate: item.rate,
        name: item.name,
        tagline: item.tagline,
      }),
    ]
  })
  const custom = LOCAL.get("custom")
  return custom ? [...plans, custom] : plans
}

/** The per-credit rate when every paid plan shares one, else `null`. */
export function sharedRate(plans: readonly PricingPlan[]): number | null {
  const rates = new Set(
    plans.filter((p) => p.billing === "credits").map((p) => p.rate)
  )
  const [rate] = rates
  return rates.size === 1 && rate != null ? rate : null
}

// in paise, so a rate like 2.35 can't drift under float maths
export const priceForCredits = (credits: number, costPerCredit: number) =>
  (Math.round(costPerCredit * 100) * credits) / 100
