import { payloadOf } from "@workspace/api"
import { api } from "@/lib/api"

import type { Order } from "../schemas/billing.schema"
import { orderSchema } from "../schemas/billing.schema"
import type { OrderRequest, RazorpayProof } from "../types"

export const createOrder = async ({ planId, credits, coupon }: OrderRequest) =>
  orderSchema.parse(
    payloadOf(
      await api.post("payment/v1/create_razorpay_order/", {
        tokens: credits,
        ...(planId && { plan_id: planId }),
        ...(coupon && { coupon_code: coupon }),
      })
    )
  )

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
