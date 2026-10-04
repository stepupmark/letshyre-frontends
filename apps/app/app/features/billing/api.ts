import { getCreditPrice, getPublicPlans } from "@workspace/api/public"
import { queryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { api } from "@/lib/api"
import { env } from "@/lib/env"
import { dataOf } from "@/lib/response"
import { safeUrl } from "@/lib/safe-url"

export const plansQuery = () =>
  queryOptions({
    queryKey: ["billing", "plans"],
    queryFn: ({ signal }) => getPublicPlans(api, { signal }),
    staleTime: 5 * 60_000,
  })

export const creditPriceQuery = () =>
  queryOptions({
    queryKey: ["billing", "credit-price"],
    queryFn: ({ signal }) => getCreditPrice(api, { signal }),
    staleTime: 5 * 60_000,
  })

const amount = z.coerce.number().nonnegative()

export const quoteSchema = z
  .looseObject({
    breakdown: z.looseObject({
      tokens: z.coerce.number().int().positive(),
      rate_per_credit: amount,
      base_amount: amount,
      discount_amount: amount.default(0),
      gst_percent: amount,
      gst_amount: amount,
      total_with_gst: amount,
    }),
    coupon: z
      .looseObject({
        code: z.string().nullish(),
        applied: z.boolean(),
        error_message: z.string().nullish(),
      })
      .nullish(),
  })
  .transform(({ breakdown, coupon }) => ({
    credits: breakdown.tokens,
    rate: breakdown.rate_per_credit,
    subtotal: breakdown.base_amount,
    discount: breakdown.discount_amount,
    gstPercent: breakdown.gst_percent,
    gst: breakdown.gst_amount,
    total: breakdown.total_with_gst,
    coupon: coupon
      ? {
          code: coupon.code ?? null,
          applied: coupon.applied,
          error: coupon.error_message ?? null,
        }
      : null,
  }))
export type Quote = z.infer<typeof quoteSchema>

export interface OrderRequest {
  planId: string | null
  credits: number
  coupon?: string | null
}

export const quoteQuery = ({ planId, credits, coupon }: OrderRequest) =>
  queryOptions({
    queryKey: ["billing", "quote", planId, credits, coupon ?? null],
    queryFn: async ({ signal }) =>
      quoteSchema.parse(
        dataOf(
          await api.get("payment/v1/employer/calculate-token-cost/", {
            query: { tokens: credits, plan_id: planId, coupon_code: coupon },
            signal,
          })
        )
      ),
    staleTime: 60_000,
  })

const orderSchema = z.looseObject({
  razorpay_key: z.string().min(1),
  order_id: z.string().min(1),
  amount: z.coerce.number().positive(),
  currency: z.string().min(1).default("INR"),
  purchase_id: z.union([z.string(), z.number()]).transform(String),
})
export type Order = z.infer<typeof orderSchema>

export const createOrder = async ({ planId, credits, coupon }: OrderRequest) =>
  orderSchema.parse(
    dataOf(
      await api.post("payment/v1/create_razorpay_order/", {
        tokens: credits,
        ...(planId && { plan_id: planId }),
        ...(coupon && { coupon_code: coupon }),
      })
    )
  )

export interface RazorpayProof {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export async function verifyPayment(proof: RazorpayProof, order: Order) {
  const body: unknown = await api.post("payment/v1/verify_razorpay_order/", {
    ...proof,
    purchase_id: order.purchase_id,
  })
  if (
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    body.success !== true
  )
    throw new Error("Payment not verified")
}

// the API sometimes sends a path relative to itself
const fileUrl = (file: string | null | undefined) => {
  if (!file) return null
  try {
    return safeUrl(new URL(file, env.VITE_API_BASE_URL).href)
  } catch {
    return null
  }
}

// only what the page shows; signatures and raw orders never reach the cache
const invoiceSchema = z
  .looseObject({
    id: z.union([z.string(), z.number()]).transform(String),
    is_paid: z.literal(true),
    invoice_number: z.string().nullish(),
    paid_at: z.string().nullish(),
    created_at: z.string(),
    tokens_credited: z.coerce.number().int().positive(),
    credit_plan: z.looseObject({ name: z.string().min(1) }).nullish(),
    base_amount: amount,
    discount_amount: amount.default(0),
    gst_amount: amount,
    total_with_gst: amount,
    promo_code: z.string().nullish(),
    coupon: z.looseObject({ code: z.string() }).nullish(),
    transaction_id: z.string().nullish(),
    invoice_file: z.string().nullish(),
  })
  .transform((row) => ({
    id: row.id,
    number: row.invoice_number ?? null,
    paidAt: row.paid_at ?? row.created_at,
    plan: row.credit_plan?.name ?? null,
    credits: row.tokens_credited,
    subtotal: row.base_amount,
    discount: row.discount_amount,
    coupon: row.coupon?.code ?? row.promo_code ?? null,
    gst: row.gst_amount,
    total: row.total_with_gst,
    reference: row.transaction_id ?? null,
    pdf: fileUrl(row.invoice_file),
  }))
export type Invoice = z.infer<typeof invoiceSchema>

export const invoicesPageSchema = z
  .looseObject({
    results: z.array(z.unknown()),
    count: z.coerce.number().nullish(),
    total_pages: z.coerce.number().int().positive().catch(1),
  })
  .transform((page) => ({
    // unpaid or unreadable rows are dropped, not the whole page
    results: page.results.flatMap((item) => {
      const row = invoiceSchema.safeParse(item)
      return row.success ? [row.data] : []
    }),
    count: page.count ?? null,
    totalPages: page.total_pages,
  }))

export const invoicesQuery = (page: number) =>
  queryOptions({
    queryKey: ["billing", "invoices", page],
    queryFn: async () =>
      invoicesPageSchema.parse(
        dataOf(
          await api.get("payment/v1/credit_purchase_history/", {
            query: { page, is_paid: true },
          })
        )
      ),
    staleTime: 30_000,
  })

export const INVOICES_KEY = ["billing", "invoices"] as const
