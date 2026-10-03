import { z } from "zod"

import { unwrap } from "../envelope.ts"
import { ResponseShapeError } from "../errors.ts"
import type { HttpClient } from "../http.ts"

const planSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1),
    name: z.string().min(1),
    credits_included: z.coerce.number().int().nonnegative(),
    base_price: z.coerce.number().nonnegative(),
    per_credit_effective_rate: z.coerce.number().positive().nullable(),
    plan_type: z.string().min(1),
    tagline: z.string().nullish(),
    highlight: z.boolean().default(false),
    sort_order: z.coerce.number().int().default(0),
  })
  .transform((plan) => ({
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    credits: plan.credits_included,
    basePrice: plan.base_price,
    rate: plan.per_credit_effective_rate,
    planType: plan.plan_type,
    tagline: plan.tagline ?? null,
    highlight: plan.highlight,
    sortOrder: plan.sort_order,
  }))

export type Plan = z.output<typeof planSchema>

const readPlans = unwrap(z.object({ results: z.array(z.unknown()) }))
const readPrice = unwrap(
  z.object({ cost_per_token: z.coerce.number().positive() })
)

/** Sorted plans. A malformed plan is dropped and logged rather than rendered. */
export async function getPublicPlans(
  client: HttpClient,
  { signal }: { signal?: AbortSignal } = {}
): Promise<Plan[]> {
  const { results } = readPlans(
    await client.get("/finances/v1/credit_plans/public/", { signal })
  )

  const plans = results.flatMap((item) => {
    const plan = planSchema.safeParse(item)
    if (plan.success) return [plan.data]
    console.warn("api: dropped a malformed plan", plan.error.issues)
    return []
  })
  if (plans.length === 0)
    throw new ResponseShapeError("No valid plans in response")

  return plans.sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function getCreditPrice(
  client: HttpClient,
  { signal }: { signal?: AbortSignal } = {}
): Promise<{ costPerCredit: number }> {
  const data = readPrice(
    await client.get("/payment/v1/public/calculate-token-cost/", {
      query: { tokens: 1 },
      signal,
    })
  )
  return { costPerCredit: data.cost_per_token }
}
