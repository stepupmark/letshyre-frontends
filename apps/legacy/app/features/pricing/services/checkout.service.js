import api from "@/services/api";
import { orderResponseSchema, quoteResponseSchema } from "@/features/pricing/schemas/checkout.schema";

export class InvalidQuoteError extends Error {
  name = "InvalidQuoteError";
}

export class OrderError extends Error {
  name = "OrderError";

  constructor(message, serverMessage) {
    super(message);
    this.serverMessage = serverMessage;
  }
}

// authOptional on every call: an expired session should land on the sign-in
// step in the dialog, not reload the page and lose the checkout.
export async function getQuote({ planId, tokens, couponCode }, { signal } = {}) {
  const response = await api.get("/payment/v1/employer/calculate-token-cost/", {
    params: { tokens, plan_id: planId, coupon_code: couponCode },
    signal,
    authOptional: true,
  });

  const parsed = quoteResponseSchema.safeParse(response.data);
  if (!parsed.success) throw new InvalidQuoteError("Unexpected quote response");

  const { breakdown, coupon } = parsed.data.data;
  return {
    credits: breakdown.tokens,
    rate: breakdown.rate_per_credit,
    subtotal: breakdown.base_amount,
    discount: breakdown.discount_amount,
    gstPercent: breakdown.gst_percent,
    gst: breakdown.gst_amount,
    total: breakdown.total_with_gst,
    coupon: coupon
      ? {
          code: coupon.code ?? couponCode ?? null,
          applied: coupon.applied,
          discountType: coupon.discount_type ?? null,
          discountValue: coupon.discount_value ?? null,
          error: coupon.error_message ?? null,
        }
      : null,
  };
}

export async function createOrder({ planId, tokens, couponCode }) {
  const response = await api.post(
    "/payment/v1/create_razorpay_order/",
    {
      tokens,
      ...(planId && { plan_id: planId }),
      ...(couponCode && { coupon_code: couponCode }),
    },
    { authOptional: true },
  );

  const parsed = orderResponseSchema.safeParse(response.data);
  if (!parsed.success) throw new OrderError("Unexpected order response", response.data?.message);

  const order = parsed.data.data;
  return {
    key: order.razorpay_key,
    orderId: order.order_id,
    amount: order.amount,
    currency: order.currency,
    purchaseId: order.purchase_id,
  };
}

export async function verifyPayment(payload) {
  const response = await api.post("/payment/v1/verify_razorpay_order/", payload, {
    authOptional: true,
  });
  return response.data;
}
