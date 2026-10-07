import { type Locale, localePath } from "@workspace/i18n"

import { APP_LINKS } from "@/lib/app-links"
import { PAGES } from "@/lib/pages"

import type { PricingPlan } from "./plans"

export const topUpKey = (credits: number) => `${credits}-credits`

export const salesContactPath = (lang: Locale) =>
  `${localePath(lang, PAGES.contact.path)}?topic=sales`

/** Free signs up, Custom talks to sales on this site, paid plans check out in the app. */
export function planHref(
  plan: Pick<PricingPlan, "id" | "billing">,
  lang: Locale
): { href: string; internal: boolean } {
  switch (plan.billing) {
    case "free":
      return { href: APP_LINKS.employerRegister, internal: false }
    case "custom":
      return { href: salesContactPath(lang), internal: true }
    case "credits":
      return { href: APP_LINKS.checkout(plan.id), internal: false }
  }
}

export const topUpHref = (credits: number) =>
  APP_LINKS.checkout(topUpKey(credits))
