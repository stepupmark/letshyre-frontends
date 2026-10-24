import type { Locale } from "@workspace/i18n"
import { href } from "react-router"

import { sitePage } from "@/lib/site"

import type { PricingPlan } from "./plans"

const checkout = (key: string) =>
  `${href("/employer/billing")}?checkout=${encodeURIComponent(key)}`

export const salesContactUrl = (locale: Locale) =>
  `${sitePage(locale, "/contact")}?topic=sales`

/** Free signs up, Custom talks to sales on the marketing site, paid plans check out in billing. */
export function planHref(
  plan: Pick<PricingPlan, "id" | "billing">,
  locale: Locale
): string {
  switch (plan.billing) {
    case "free":
      return href("/employer/register")
    case "custom":
      return salesContactUrl(locale)
    case "credits":
      return checkout(plan.id)
  }
}

export const topUpHref = (credits: number) => checkout(`${credits}-credits`)
