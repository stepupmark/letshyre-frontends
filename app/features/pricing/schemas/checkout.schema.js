import { z } from "zod";

const amount = z.coerce.number().nonnegative();

export const quoteResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    breakdown: z.object({
      tokens: z.coerce.number().int().positive(),
      rate_per_credit: amount,
      base_amount: amount,
      discount_amount: amount.default(0),
      gst_percent: amount,
      gst_amount: amount,
      total_with_gst: amount,
    }),
    coupon: z
      .object({
        code: z.string().nullable().optional(),
        applied: z.boolean(),
        discount_type: z.string().nullable().optional(),
        discount_value: amount.nullable().optional(),
        error_message: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  }),
});

export const orderResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    razorpay_key: z.string().min(1),
    order_id: z.string().min(1),
    amount: z.coerce.number().positive(),
    currency: z.string().min(1).default("INR"),
    purchase_id: z.string().min(1),
  }),
});

// `t` is the `pricing` namespace translator.
export const makeCouponSchema = (t) =>
  z.object({
    code: z
      .string()
      .trim()
      .min(1, t("checkout.coupon.required"))
      .max(32, t("checkout.coupon.invalid"))
      .regex(/^[A-Za-z0-9_-]+$/, t("checkout.coupon.invalid"))
      .transform((code) => code.toUpperCase()),
  });
