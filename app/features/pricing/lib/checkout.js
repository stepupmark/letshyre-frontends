import { ROLES } from "@/constants";
import { getUser } from "@/lib/getUser";
import { TOP_UPS } from "@/features/pricing/lib/plans";

export const CHECKOUT_PARAM = "checkout";

// Marks a checkout opened from this page, so closing it can go back a step
// instead of leaving an extra history entry behind.
export const CHECKOUT_STATE = { checkout: true };

const TOP_UP_KEY = /^(\d+)-credits$/;

export const topUpKey = (credits) => `${credits}-credits`;

export const checkoutSearch = (key) => `?${new URLSearchParams({ [CHECKOUT_PARAM]: key })}`;

export function findCheckoutItem(key, plans) {
  const topUp = TOP_UP_KEY.exec(key);
  if (topUp) {
    const credits = Number(topUp[1]);
    return TOP_UPS.some((pack) => pack.credits === credits)
      ? { key, kind: "topUp", credits, planId: null }
      : null;
  }

  const plan = plans.find((p) => p.id === key && p.billing === "credits" && p.planId);
  return plan ? { key, kind: "plan", plan, credits: plan.credits, planId: plan.planId } : null;
}

// Read at open time, never during the prerender: the page has no session then.
export function resolveBuyer() {
  const { isAuthenticated, role, user } = getUser();
  if (!isAuthenticated) return "guest";
  if (role !== ROLES.EMPLOYER) return "candidate";
  if (user?.is_profile_completed === false) return "onboarding";
  return "employer";
}

export const toPaise = (amount) => Math.round(Number(amount) * 100);
