import { z } from "zod";
import { envelope, id, paginated } from "~/lib/api/schemas";

const count = z
  .number()
  .nullish()
  .transform((value) => value ?? 0);

const money = z.union([z.string(), z.number()]).nullish();

const paymentSummarySchema = z.object({
  total_payments: count,
  success_payments: count,
  pending_payments: count,
  failed_payments: count,
  repeated_customers: count,
});

const paymentSchema = z.object({
  id,
  employeer: z.string().nullish(),
  employeer_id: z.union([z.string(), z.number()]).nullish(),
  company: z.string().nullish(),
  tokens_credited: z.number().nullish(),
  amount_paid: money,
  total_with_gst: money,
  currency: z.string().nullish(),
  payment_status: z.string(),
  payment_order_id: z.string().nullish(),
  invoice_number: z.string().nullish(),
  created_at: z.string(),
});

export const paymentSummaryResponseSchema = envelope(paymentSummarySchema);
export const paymentsResponseSchema = envelope(paginated(paymentSchema));

export const PAYMENT_STATUSES = ["Success", "Pending", "Failed"] as const;

export type Payment = z.infer<typeof paymentSchema>;
export type PaymentFilters = {
  page: number;
  search?: string;
  payment_status?: string;
  company?: string;
  min_amount?: string;
  max_amount?: string;
  start_date?: string;
  end_date?: string;
};
