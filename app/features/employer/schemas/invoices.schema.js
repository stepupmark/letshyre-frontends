import { z } from "zod";

const amount = z.coerce.number().nonnegative();

export const invoicesResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    results: z.array(z.unknown()),
    total_pages: z.coerce.number().int().positive().catch(1),
    current_page: z.coerce.number().int().positive().optional(),
  }),
});

// Only what the page shows. Signatures, Razorpay keys and raw order payloads
// in the response are dropped here and never reach the UI or the cache.
export const invoiceRowSchema = z.object({
  id: z.string().min(1),
  is_paid: z.literal(true),
  invoice_number: z.string().nullable().optional(),
  paid_at: z.string().nullable().optional(),
  created_at: z.string(),
  tokens_credited: z.coerce.number().int().positive(),
  credit_plan: z.object({ name: z.string().min(1) }).nullable().optional(),
  base_amount: amount,
  discount_amount: amount.default(0),
  gst_amount: amount,
  total_with_gst: amount,
  promo_code: z.string().nullable().optional(),
  coupon: z.object({ code: z.string() }).nullable().optional(),
  transaction_id: z.string().nullable().optional(),
  invoice_file: z.string().nullable().optional(),
});
