import { afterEach, describe, expect, it } from "vitest";
import { PLANS, mergePlans } from "./plans";
import { checkoutSearch, findCheckoutItem, resolveBuyer, toPaise, topUpKey } from "./checkout";

const plans = mergePlans([
  {
    id: "pro-id",
    slug: "pro",
    name: "Pro",
    credits: 50,
    basePrice: 500,
    rate: 10,
    planType: "paid_one_time",
    highlight: false,
    sortOrder: 10,
  },
  {
    id: "free-id",
    slug: "free",
    name: "Free",
    credits: 0,
    basePrice: 0,
    rate: null,
    planType: "free",
    highlight: false,
    sortOrder: 0,
  },
]);

const signIn = (user) => localStorage.setItem("user", JSON.stringify(user));

afterEach(() => localStorage.clear());

describe("findCheckoutItem", () => {
  it("finds a paid plan by its slug", () => {
    expect(findCheckoutItem("pro", plans)).toMatchObject({
      kind: "plan",
      planId: "pro-id",
      credits: 50,
    });
  });

  it("finds a top-up pack", () => {
    expect(findCheckoutItem(topUpKey(25), plans)).toEqual({
      key: "25-credits",
      kind: "topUp",
      credits: 25,
      planId: null,
    });
  });

  it.each([
    ["the free plan", "free"],
    ["the custom plan", "custom"],
    ["an unknown slug", "enterprise"],
    ["a pack the page doesn't sell", "7-credits"],
  ])("won't sell %s", (_, key) => {
    expect(findCheckoutItem(key, plans)).toBeNull();
  });

  it("waits for live plans before selling one", () => {
    expect(findCheckoutItem("pro", PLANS)).toBeNull();
  });
});

describe("checkoutSearch", () => {
  it("encodes the key", () => {
    expect(checkoutSearch("pro")).toBe("?checkout=pro");
    expect(checkoutSearch("a b")).toBe("?checkout=a+b");
  });
});

describe("resolveBuyer", () => {
  it("treats a missing session as a guest", () => {
    expect(resolveBuyer()).toBe("guest");
  });

  it("stops candidates", () => {
    signIn({ role: "Employee" });
    expect(resolveBuyer()).toBe("candidate");
  });

  it("sends an employer with an unfinished profile to onboarding", () => {
    signIn({ role: "Employer", is_profile_completed: false });
    expect(resolveBuyer()).toBe("onboarding");
  });

  it("lets an employer buy", () => {
    signIn({ role: "Employer", is_profile_completed: true });
    expect(resolveBuyer()).toBe("employer");
  });
});

describe("toPaise", () => {
  it("rounds away float error", () => {
    expect(toPaise(11.8)).toBe(1180);
    expect(toPaise("1062.00")).toBe(106200);
  });
});
