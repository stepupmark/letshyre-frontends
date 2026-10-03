import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { setAccessToken } from "@/lib/authStorage";
import {
  CREDIT_PRICE_QUANTITY,
  InvalidPriceError,
  getCreditPrice,
  getPublicPlans,
} from "./pricing.service";

let handler;
const respond = (config, data) => ({ status: 200, data, config, headers: {} });

beforeEach(() => {
  localStorage.clear();
  handler = vi.fn();
  api.defaults.adapter = (config) => Promise.resolve(handler(config));
});

describe("getCreditPrice", () => {
  it("asks the public endpoint for one credit, without a token even when signed in", async () => {
    setAccessToken("access-1");
    handler.mockImplementation((c) => respond(c, { success: true, data: { cost_per_token: 2 } }));
    await getCreditPrice();

    const config = handler.mock.calls[0][0];
    expect(CREDIT_PRICE_QUANTITY).toBe(1);
    expect(config.params).toEqual({ tokens: 1 });
    expect(config.url).toBe("/payment/v1/public/calculate-token-cost/");
    expect(config.headers.Authorization).toBeUndefined();
  });

  it("returns the per-credit price", async () => {
    handler.mockImplementation((c) => respond(c, { success: true, data: { cost_per_token: 2.35 } }));
    await expect(getCreditPrice()).resolves.toEqual({ costPerCredit: 2.35 });
  });

  it("forwards the abort signal", async () => {
    handler.mockImplementation((c) => respond(c, { success: true, data: { cost_per_token: 2 } }));
    const controller = new AbortController();
    await getCreditPrice({ signal: controller.signal });
    expect(handler.mock.calls[0][0].signal).toBe(controller.signal);
  });

  it.each([
    ["a failed envelope", { success: false, data: { cost_per_token: 2 } }],
    ["a missing price", { success: true, data: {} }],
    ["a zero price", { success: true, data: { cost_per_token: 0 } }],
    ["a non-numeric price", { success: true, data: { cost_per_token: "free" } }],
  ])("rejects %s", async (_, body) => {
    handler.mockImplementation((c) => respond(c, body));
    await expect(getCreditPrice()).rejects.toBeInstanceOf(InvalidPriceError);
  });
});

describe("getPublicPlans", () => {
  const plan = {
    id: "8ddf048e",
    name: "Business",
    slug: "business",
    credits_included: 100,
    base_price: "1000.00",
    currency: "INR",
    per_credit_effective_rate: "10.00",
    plan_type: "paid_one_time",
    tagline: "Most credits",
    highlight: true,
    description: "Not rendered",
    sort_order: 20,
  };
  const envelope = (results) => ({ success: true, data: { count: results.length, results } });

  it("sends no token, even when signed in", async () => {
    setAccessToken("access-1");
    handler.mockImplementation((c) => respond(c, envelope([plan])));
    await getPublicPlans();

    const config = handler.mock.calls[0][0];
    expect(config.url).toBe("/finances/v1/credit_plans/public/");
    expect(config.headers.Authorization).toBeUndefined();
  });

  it("turns money strings into numbers", async () => {
    handler.mockImplementation((c) => respond(c, envelope([plan])));
    await expect(getPublicPlans()).resolves.toEqual([
      {
        id: "8ddf048e",
        slug: "business",
        name: "Business",
        credits: 100,
        basePrice: 1000,
        rate: 10,
        planType: "paid_one_time",
        tagline: "Most credits",
        highlight: true,
        sortOrder: 20,
      },
    ]);
  });

  it("keeps a free plan with no per-credit rate", async () => {
    const free = { ...plan, slug: "free", base_price: "0.00", per_credit_effective_rate: null };
    handler.mockImplementation((c) => respond(c, envelope([free])));
    const [result] = await getPublicPlans();
    expect(result).toMatchObject({ basePrice: 0, rate: null });
  });

  it("drops a malformed plan instead of failing the rest", async () => {
    handler.mockImplementation((c) =>
      respond(c, envelope([plan, { ...plan, slug: "", id: "broken" }, { ...plan, base_price: "free" }])),
    );
    await expect(getPublicPlans()).resolves.toHaveLength(1);
  });

  it.each([
    ["a failed envelope", { success: false, data: { results: [plan] } }],
    ["no results", { success: true, data: {} }],
    ["no usable plans", { success: true, data: { results: [{ slug: "pro" }] } }],
  ])("rejects %s", async (_, body) => {
    handler.mockImplementation((c) => respond(c, body));
    await expect(getPublicPlans()).rejects.toBeInstanceOf(InvalidPriceError);
  });
});
