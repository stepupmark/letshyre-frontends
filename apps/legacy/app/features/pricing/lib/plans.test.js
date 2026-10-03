import { beforeAll, describe, expect, it } from "vitest";
import en from "@/i18n/messages/en/pricing.json";
import { getI18n } from "@/i18n/i18n";
import {
  COMPARISON_ROWS,
  PLANS,
  formatAmount,
  formatPrice,
  mergePlans,
  priceForCredits,
  sharedRate,
} from "./plans";
import { pricingSchemas } from "./pricingSchema";

beforeAll(() => {
  getI18n("en").addResourceBundle("en", "pricing", en, true, true);
});

const livePlan = (overrides) => ({
  id: "uuid",
  slug: "pro",
  name: "Pro",
  credits: 50,
  basePrice: 500,
  rate: 10,
  planType: "paid_one_time",
  tagline: null,
  highlight: false,
  sortOrder: 10,
  ...overrides,
});

describe("plans", () => {
  it("has English copy for every plan", () => {
    for (const plan of PLANS) {
      for (const key of ["name", "audience", "priceNote", "cta"]) {
        expect(en.plans[plan.id][key], `${plan.id}.${key}`).toBeTruthy();
      }
    }
  });

  it("has a label for every comparison row", () => {
    for (const row of COMPARISON_ROWS) expect(en.compare.rows[row.id]).toBeTruthy();
  });

  it("marks exactly one plan as featured", () => {
    expect(PLANS.filter((plan) => plan.featured)).toHaveLength(1);
  });
});

describe("mergePlans", () => {
  it("orders live plans by sort order and keeps the custom plan last", () => {
    const plans = mergePlans([
      livePlan({ id: "b", slug: "business", credits: 100, basePrice: 1000, sortOrder: 20 }),
      livePlan({ id: "p", slug: "pro", sortOrder: 10 }),
    ]);
    expect(plans.map((plan) => plan.id)).toEqual(["pro", "business", "custom"]);
  });

  it("takes price, credits and highlight from the API and features from the page", () => {
    const [business] = mergePlans([
      livePlan({ id: "b", slug: "business", credits: 80, basePrice: 800, highlight: false }),
    ]);
    expect(business).toMatchObject({
      planId: "b",
      billing: "credits",
      credits: 80,
      price: 800,
      rate: 10,
      featured: false,
      seats: 25,
      topUps: true,
    });
  });

  it("keeps the sign-up credits for the free plan", () => {
    const [free] = mergePlans([livePlan({ slug: "free", planType: "free", credits: 0, basePrice: 0 })]);
    expect(free).toMatchObject({ billing: "free", credits: 10, price: 0 });
  });

  it("renders a plan the page doesn't know yet, and drops unknown billing types", () => {
    const plans = mergePlans([
      livePlan({ slug: "scale", name: "Scale" }),
      livePlan({ slug: "monthly", planType: "subscription" }),
    ]);
    expect(plans.map((plan) => plan.id)).toEqual(["scale", "custom"]);
    expect(plans[0]).toMatchObject({ name: "Scale", billing: "credits", topUps: true });
  });
});

describe("sharedRate", () => {
  it("returns the rate when every paid plan shares it", () => {
    expect(sharedRate(mergePlans([livePlan({}), livePlan({ slug: "business" })]))).toBe(10);
  });

  it("returns null when paid plans differ", () => {
    expect(sharedRate(mergePlans([livePlan({}), livePlan({ slug: "business", rate: 8 })]))).toBeNull();
  });
});

describe("priceForCredits", () => {
  it("multiplies the per-credit rate", () => {
    expect(priceForCredits(50, 2)).toBe(100);
  });

  it("stays exact for fractional rates", () => {
    expect(priceForCredits(3, 0.1)).toBe(0.3);
    expect(priceForCredits(200, 2.35)).toBe(470);
  });
});

describe("formatPrice", () => {
  it("drops paise on whole rupees and keeps two places otherwise", () => {
    expect(formatPrice("en", 2999)).toBe("₹2,999");
    expect(formatPrice("en", 2.5)).toBe("₹2.50");
  });
});

describe("formatAmount", () => {
  it("always shows paise, as on an invoice", () => {
    expect(formatAmount("en", 1062)).toBe("₹1,062.00");
    expect(formatAmount("en", -100)).toBe("-₹100.00");
  });
});

describe("pricingSchemas", () => {
  it("builds the FAQ from the rendered questions, without markup", () => {
    const [faq] = pricingSchemas("en");
    expect(faq["@type"]).toBe("FAQPage");
    expect(faq.mainEntity).toHaveLength(en.faq.items.length);
    for (const question of faq.mainEntity) {
      expect(question.acceptedAnswer.text).not.toMatch(/<[^>]+>/);
    }
  });

  it("claims no prices it can't show at build time", () => {
    expect(JSON.stringify(pricingSchemas("en"))).not.toMatch(/"price"/);
  });
});
