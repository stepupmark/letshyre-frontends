import { z } from "zod";

export const creditPriceResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    cost_per_token: z.coerce.number().positive(),
  }),
});

export const plansResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    results: z.array(z.unknown()),
  }),
});

export const planSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  credits_included: z.coerce.number().int().nonnegative(),
  base_price: z.coerce.number().nonnegative(),
  per_credit_effective_rate: z.coerce.number().positive().nullable(),
  plan_type: z.string(),
  tagline: z.string().nullable().optional(),
  highlight: z.boolean().default(false),
  sort_order: z.coerce.number().default(0),
});
