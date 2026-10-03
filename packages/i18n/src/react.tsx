import { createContext, use, useMemo, type ReactNode } from "react"
import { I18nextProvider } from "react-i18next"

import type { Locale } from "./config.ts"
import { addMessages, getI18n, type Messages } from "./create-i18n.ts"
import {
  formatCurrency,
  formatDate,
  formatList,
  formatNumber,
  formatRelative,
} from "./format.ts"

const LocaleContext = createContext<Locale | null>(null)

export function I18nProvider({
  lang,
  messages = {},
  children,
}: {
  lang: Locale
  messages?: Messages
  children: ReactNode
}) {
  // idempotent, and has to happen before children render on the prerender pass
  addMessages(messages)

  return (
    <LocaleContext value={lang}>
      <I18nextProvider i18n={getI18n(lang)}>{children}</I18nextProvider>
    </LocaleContext>
  )
}

export function useLocale(): Locale {
  const locale = use(LocaleContext)
  if (!locale) throw new Error("useLocale must be used inside <I18nProvider>")
  return locale
}

/** Formatters bound to the current locale. */
export function useFormat() {
  const locale = useLocale()
  return useMemo(
    () => ({
      number: (value: number, options?: Intl.NumberFormatOptions) =>
        formatNumber(locale, value, options),
      currency: (
        value: number,
        currency?: string,
        options?: Intl.NumberFormatOptions
      ) => formatCurrency(locale, value, currency, options),
      date: (
        value: Date | string | number,
        options?: Intl.DateTimeFormatOptions
      ) => formatDate(locale, value, options),
      relative: (value: Date | string | number, now?: Date | string | number) =>
        formatRelative(locale, value, now),
      list: (items: readonly string[], options?: Intl.ListFormatOptions) =>
        formatList(locale, items, options),
    }),
    [locale]
  )
}

export { Trans, useTranslation } from "react-i18next"
