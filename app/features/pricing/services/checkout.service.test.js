import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { InvalidQuoteError, OrderError, createOrder, getQuote, verifyPayment } from "./checkout.service";

let handler;
const respond = (config, data) => ({ status: 200, data, config, headers: {} });

const quoteBody = (overrides = {}) => ({
  success: true,
  data: {
    breakdown: {
      tokens: 100,
      rate_per_credit: "10.00",
      base_amount: "1000.00",
      subtotal_after_discount: "900.00",
      gst_percent: "18",
      gst_amount: "162.00",
      discount_amount: "100.00",
      total_with_gst: "1062.00",
      credit_plan_slug: "business",
    },
    coupon: {
      code: "P0TENOFF2",
      discount_type: "percentage",
      discount_value: "10.00",
      applied: true,
      error_code: null,
      error_message: null,
    },
    ...overrides,
  },
});

beforeEach(() => {
  localStorage.clear();
  handler = vi.fn();
  api.defaults.adapter = (config) => Promise.resolve(handler(config));
});

describe("getQuote", () => {
  it("prices a plan with a coupon on an auth-optional request", async () => {
    handler.mockImplementation((c) => respond(c, quoteBody()));
    await getQuote({ planId: "plan-1", tokens: 100, couponCode: "P0TENOFF2" });

    const config = handler.mock.calls[0][0];
    expect(config.url).toBe("/payment/v1/employer/calculate-token-cost/");
    expect(config.params).toEqual({ tokens: 100, plan_id: "plan-1", coupon_code: "P0TENOFF2" });
    expect(config.authOptional).toBe(true);
  });

  it("leaves plan and coupon out of the URL for a plain top-up", async () => {
    handler.mockImplementation((c) => respond(c, quoteBody({ coupon: null })));
    await getQuote({ planId: null, tokens: 25 });
    expect(api.getUri(handler.mock.calls[0][0])).toMatch(/calculate-token-cost\/\?tokens=25$/);
  });

  it("returns the server's figures as numbers", async () => {
    handler.mockImplementation((c) => respond(c, quoteBody()));
    await expect(getQuote({ planId: "plan-1", tokens: 100, couponCode: "P0TENOFF2" })).resolves.toEqual({
      credits: 100,
      rate: 10,
      subtotal: 1000,
      discount: 100,
      gstPercent: 18,
      gst: 162,
      total: 1062,
      coupon: {
        code: "P0TENOFF2",
        applied: true,
        discountType: "percentage",
        discountValue: 10,
        error: null,
      },
    });
  });

  it("passes a rejected coupon's reason through", async () => {
    handler.mockImplementation((c) =>
      respond(
        c,
        quoteBody({ coupon: { code: "OLD", applied: false, error_code: "expired", error_message: "This coupon has expired." } }),
      ),
    );
    const quote = await getQuote({ planId: "plan-1", tokens: 100, couponCode: "OLD" });
    expect(quote.coupon).toMatchObject({ applied: false, error: "This coupon has expired." });
  });

  it("rejects a breakdown it can't read", async () => {
    handler.mockImplementation((c) => respond(c, { success: true, data: { breakdown: { tokens: 1 } } }));
    await expect(getQuote({ tokens: 1 })).rejects.toBeInstanceOf(InvalidQuoteError);
  });
});

describe("createOrder", () => {
  const orderBody = {
    success: true,
    data: {
      razorpay_key: "rzp_test_key",
      order_id: "order_1",
      amount: 11.8,
      currency: "INR",
      purchase_id: "purchase-1",
      plan: null,
      breakdown: {},
    },
  };

  it("sends plan, credits and coupon for a plan", async () => {
    handler.mockImplementation((c) => respond(c, orderBody));
    await createOrder({ planId: "plan-1", tokens: 100, couponCode: "P0TENOFF2" });

    const config = handler.mock.calls[0][0];
    expect(config.url).toBe("/payment/v1/create_razorpay_order/");
    expect(JSON.parse(config.data)).toEqual({ tokens: 100, plan_id: "plan-1", coupon_code: "P0TENOFF2" });
    expect(config.authOptional).toBe(true);
  });

  it("sends only the credits for a top-up without a coupon", async () => {
    handler.mockImplementation((c) => respond(c, orderBody));
    await createOrder({ planId: null, tokens: 25 });
    expect(JSON.parse(handler.mock.calls[0][0].data)).toEqual({ tokens: 25 });
  });

  it("returns what Razorpay needs", async () => {
    handler.mockImplementation((c) => respond(c, orderBody));
    await expect(createOrder({ tokens: 1 })).resolves.toEqual({
      key: "rzp_test_key",
      orderId: "order_1",
      amount: 11.8,
      currency: "INR",
      purchaseId: "purchase-1",
    });
  });

  it("keeps the server's reason when the order isn't created", async () => {
    handler.mockImplementation((c) => respond(c, { success: false, message: "Top-ups need a paid plan." }));
    const error = await createOrder({ tokens: 10 }).catch((thrown) => thrown);
    expect(error).toBeInstanceOf(OrderError);
    expect(error.serverMessage).toBe("Top-ups need a paid plan.");
  });
});

describe("verifyPayment", () => {
  it("posts Razorpay's proof on an auth-optional request", async () => {
    handler.mockImplementation((c) => respond(c, { success: true }));
    const payload = {
      razorpay_payment_id: "pay_1",
      razorpay_order_id: "order_1",
      razorpay_signature: "sig",
      purchase_id: "purchase-1",
    };
    await expect(verifyPayment(payload)).resolves.toEqual({ success: true });

    const config = handler.mock.calls[0][0];
    expect(config.url).toBe("/payment/v1/verify_razorpay_order/");
    expect(JSON.parse(config.data)).toEqual(payload);
    expect(config.authOptional).toBe(true);
  });
});
