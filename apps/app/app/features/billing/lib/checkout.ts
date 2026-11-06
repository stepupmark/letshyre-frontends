import type { Plan } from "@workspace/api/public"

export const CHECKOUT = "checkout"
export const NEXT = "next"

export const TOP_UPS = [10, 25, 50, 100] as const
export const topUpKey = (credits: number) => `${credits}-credits`

export type CheckoutItem =
  | { key: string; kind: "plan"; plan: Plan; credits: number; planId: string }
  | { key: string; kind: "topUp"; credits: number; planId: null }

/** Plans that can be bought here: paid once, for credits. */
export const paidPlans = (plans: readonly Plan[]) =>
  plans.filter((plan) => plan.planType === "paid_one_time")

/** What `?checkout=` sells: a paid plan by slug, or a known top-up pack. */
export function checkoutItem(
  key: string | null,
  plans: readonly Plan[]
): CheckoutItem | null {
  if (!key) return null
  const topUp = /^(\d+)-credits$/.exec(key)
  if (topUp) {
    const credits = Number(topUp[1])
    return (TOP_UPS as readonly number[]).includes(credits)
      ? { key, kind: "topUp", credits, planId: null }
      : null
  }
  const plan = paidPlans(plans).find((p) => p.slug === key)
  return plan
    ? { key, kind: "plan", plan, credits: plan.credits, planId: plan.id }
    : null
}

// rupees to paise without float drift, so 2.35 × 100 can't become 234.99…
export const toPaise = (amount: number) => Math.round(amount * 100)

/** Only a path inside the employer app may be returned to after paying. */
export const employerNext = (value: string | null) =>
  value && /^\/employer(\/|\?|$)/.test(value) && !value.startsWith("//")
    ? value
    : null
