import api from "@/services/api";
import {
  creditPriceResponseSchema,
  planSchema,
  plansResponseSchema,
} from "@/features/pricing/schemas/pricing.schema";

// The endpoint prices any quantity; top-ups only ever ask for one credit.
export const CREDIT_PRICE_QUANTITY = 1;

export class InvalidPriceError extends Error {
  name = "InvalidPriceError";
}

export async function getCreditPrice({ signal } = {}) {
  const response = await api.get("/payment/v1/public/calculate-token-cost/", {
    params: { tokens: CREDIT_PRICE_QUANTITY },
    signal,
  });

  const parsed = creditPriceResponseSchema.safeParse(response.data);
  if (!parsed.success) throw new InvalidPriceError("Unexpected credit price response");

  return { costPerCredit: parsed.data.data.cost_per_token };
}

const toPlan = (plan) => ({
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
});

// One malformed plan is dropped rather than taking the whole grid down with it.
export async function getPublicPlans({ signal } = {}) {
  const response = await api.get("/finances/v1/credit_plans/public/", { signal });

  const parsed = plansResponseSchema.safeParse(response.data);
  if (!parsed.success) throw new InvalidPriceError("Unexpected plans response");

  const plans = parsed.data.data.results.flatMap((item) => {
    const plan = planSchema.safeParse(item);
    return plan.success ? [toPlan(plan.data)] : [];
  });
  if (!plans.length) throw new InvalidPriceError("No valid plans in response");

  return plans;
}
