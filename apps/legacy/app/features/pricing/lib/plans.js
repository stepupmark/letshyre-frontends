import { formatCurrencyFor } from "@/i18n/format";

// What each plan includes beyond what the API returns. These render until the
// live plans load, so the prerendered page still lists every plan.
export const PLANS = [
  { id: "free", billing: "free", credits: 10, seats: 1, topUps: false },
  { id: "pro", billing: "credits", credits: 50, seats: 5, topUps: true },
  {
    id: "business",
    billing: "credits",
    credits: 100,
    seats: 25,
    topUps: true,
    featured: true,
  },
  {
    id: "custom",
    billing: "custom",
    credits: null,
    seats: null,
    topUps: true,
    support: true,
  },
];

export const TOP_UPS = [
  { credits: 10 },
  { credits: 25 },
  { credits: 50 },
  { credits: 100 },
];

export const COMPARISON_ROWS = [
  { id: "credits", value: (plan) => plan.credits },
  { id: "profiles", value: () => true },
  { id: "scorecards", value: () => true },
  { id: "recordings", value: () => true },
  { id: "seats", value: (plan) => plan.seats ?? null },
  { id: "topUps", value: (plan) => plan.topUps },
  { id: "validity", value: () => "noExpiry" },
  { id: "support", value: (plan) => Boolean(plan.support) },
];

const LOCAL_PLANS = new Map(PLANS.map((plan) => [plan.id, plan]));
const BILLING = { free: "free", paid_one_time: "credits" };

export function mergePlans(livePlans) {
  const plans = livePlans
    .filter((plan) => BILLING[plan.planType])
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((plan) => {
      const local = LOCAL_PLANS.get(plan.slug) ?? { topUps: true };
      const billing = BILLING[plan.planType];
      return {
        ...local,
        id: plan.slug,
        planId: plan.id,
        billing,
        // Sign-up credits aren't in the API, which only counts purchased ones.
        credits:
          billing === "free" ? (local.credits ?? plan.credits) : plan.credits,
        price: plan.basePrice,
        rate: plan.rate,
        featured: plan.highlight,
        name: plan.name,
        tagline: plan.tagline,
      };
    });

  return [...plans, LOCAL_PLANS.get("custom")];
}

export const sharedRate = (plans) => {
  const rates = new Set(
    plans.filter((plan) => plan.billing === "credits").map((plan) => plan.rate),
  );
  return rates.size === 1 ? [...rates][0] : null;
};

// Worked in paise so a fractional rate like 2.35 can't drift under float maths.
export const priceForCredits = (credits, costPerCredit) =>
  (Math.round(costPerCredit * 100) * credits) / 100;

export const formatPrice = (lang, value) => {
  const digits = Number.isInteger(value) ? 0 : 2;
  return formatCurrencyFor(`${lang}-IN`, value, "INR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

export const formatAmount = (lang, value) =>
  formatCurrencyFor(`${lang}-IN`, value, "INR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
