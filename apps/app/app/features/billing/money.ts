import { localePath, type Locale } from "@workspace/i18n"

import { env } from "@/lib/env"

/** Rupees as on an invoice: paise always shown unless `whole` and the amount is whole. */
export const formatRupees = (locale: string, value: number, whole = false) => {
  const digits = whole && Number.isInteger(value) ? 0 : 2
  return new Intl.NumberFormat(`${locale}-IN`, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

/** A page on the marketing site, in the reader's language. */
export const sitePage = (locale: Locale, path: string) =>
  new URL(localePath(locale, path), env.VITE_SITE_URL).href
