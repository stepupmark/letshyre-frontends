import { useTranslation } from "@workspace/i18n/react"

import { isKnownPlan, type PricingPlan } from "../lib/plans"

/** Catalog copy for the plans we know, API copy for any the backend adds later. */
export function usePlanCopy() {
  const { t } = useTranslation("pricing")

  const name = (plan: PricingPlan) =>
    isKnownPlan(plan.id) ? t(`plans.${plan.id}.name`) : (plan.name ?? plan.id)

  return {
    name,
    audience: (plan: PricingPlan) =>
      isKnownPlan(plan.id)
        ? t(`plans.${plan.id}.audience`)
        : (plan.tagline ?? ""),
    priceNote: (plan: PricingPlan) =>
      isKnownPlan(plan.id)
        ? t(`plans.${plan.id}.priceNote`)
        : t("plans.pro.priceNote"),
    cta: (plan: PricingPlan) =>
      isKnownPlan(plan.id)
        ? t(`plans.${plan.id}.cta`)
        : t("plans.buy", { name: name(plan) }),
    badge: (plan: PricingPlan) =>
      plan.id === "business"
        ? t("plans.business.badge")
        : t("plans.recommended"),
  }
}
