import { queryOptions } from "@tanstack/react-query"
import type { Locale } from "react-day-picker"

// Malayalam and Urdu have no DayPicker locale; Intl still names their months
const LOCALES: Record<string, () => Promise<Locale>> = {
  ar: () => import("react-day-picker/locale/ar").then((m) => m.ar),
  bn: () => import("react-day-picker/locale/bn").then((m) => m.bn),
  de: () => import("react-day-picker/locale/de").then((m) => m.de),
  es: () => import("react-day-picker/locale/es").then((m) => m.es),
  fr: () => import("react-day-picker/locale/fr").then((m) => m.fr),
  hi: () => import("react-day-picker/locale/hi").then((m) => m.hi),
  id: () => import("react-day-picker/locale/id").then((m) => m.id),
  it: () => import("react-day-picker/locale/it").then((m) => m.it),
  ja: () => import("react-day-picker/locale/ja").then((m) => m.ja),
  kn: () => import("react-day-picker/locale/kn").then((m) => m.kn),
  ko: () => import("react-day-picker/locale/ko").then((m) => m.ko),
  nl: () => import("react-day-picker/locale/nl").then((m) => m.nl),
  pt: () => import("react-day-picker/locale/pt").then((m) => m.pt),
  ru: () => import("react-day-picker/locale/ru").then((m) => m.ru),
  ta: () => import("react-day-picker/locale/ta").then((m) => m.ta),
  te: () => import("react-day-picker/locale/te").then((m) => m.te),
}

const loadLocale = (locale: string) =>
  (
    LOCALES[locale.split("-")[0] ?? ""] ??
    (() => import("react-day-picker/locale/en-IN").then((m) => m.enIN))
  )()

export const calendarLocaleQuery = (locale: string) =>
  queryOptions({
    queryKey: ["calendar-locale", locale],
    queryFn: () => loadLocale(locale),
    staleTime: Infinity,
  })
