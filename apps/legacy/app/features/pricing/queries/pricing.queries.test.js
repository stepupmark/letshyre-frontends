import { describe, expect, it } from "vitest";
import { queryKeys } from "@/lib/queryKeys";
import { InvalidPriceError } from "@/features/pricing/services/pricing.service";
import { creditPriceQuery, publicPlansQuery, retryPrice } from "./pricing.queries";
import { quoteQuery, retryQuote } from "./checkout.queries";

const httpError = (status) => Object.assign(new Error(String(status)), { response: { status } });

describe("query keys", () => {
  it("use the shared keys", () => {
    expect(publicPlansQuery().queryKey).toEqual(queryKeys.pricing.plans());
    expect(creditPriceQuery().queryKey).toEqual(queryKeys.pricing.creditPrice());
  });

  it("key a quote by plan, quantity and coupon", () => {
    const plain = quoteQuery({ planId: "p", tokens: 50 }).queryKey;
    const couponed = quoteQuery({ planId: "p", tokens: 50, couponCode: "SAVE10" }).queryKey;
    expect(plain).toEqual(["pricing", "quote", "p", 50, null]);
    expect(couponed).toEqual(["pricing", "quote", "p", 50, "SAVE10"]);
  });
});

describe("retryPrice", () => {
  it("doesn't retry what a retry can't fix", () => {
    expect(retryPrice(0, httpError(401))).toBe(false);
    expect(retryPrice(0, httpError(403))).toBe(false);
    expect(retryPrice(0, new InvalidPriceError("bad"))).toBe(false);
  });

  it("retries transient failures twice", () => {
    expect(retryPrice(0, httpError(503))).toBe(true);
    expect(retryPrice(1, new Error("Network Error"))).toBe(true);
    expect(retryPrice(2, httpError(503))).toBe(false);
  });
});

describe("retryQuote", () => {
  it("doesn't retry a client error", () => {
    expect(retryQuote(0, httpError(400))).toBe(false);
    expect(retryQuote(0, httpError(401))).toBe(false);
    expect(retryQuote(0, Object.assign(new Error("bad"), { name: "InvalidQuoteError" }))).toBe(false);
  });

  it("retries a server or network failure twice", () => {
    expect(retryQuote(0, httpError(502))).toBe(true);
    expect(retryQuote(1, new Error("Network Error"))).toBe(true);
    expect(retryQuote(2, httpError(502))).toBe(false);
  });
});
