import type { Locale } from "./config.ts"

const cache = new Map<string, unknown>()

function cached<T>(
  kind: string,
  locale: Locale,
  options: object,
  create: () => T
): T {
  const key = `${kind}|${locale}|${JSON.stringify(options)}`
  let formatter = cache.get(key) as T | undefined
  if (!formatter) {
    formatter = create()
    cache.set(key, formatter)
  }
  return formatter
}

type DateInput = Date | string | number

function toDate(value: DateInput): Date | null {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatNumber(
  locale: Locale,
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return cached(
    "number",
    locale,
    options,
    () => new Intl.NumberFormat(locale, options)
  ).format(value)
}

export function formatCurrency(
  locale: Locale,
  value: number,
  currency = "INR",
  options: Intl.NumberFormatOptions = {}
): string {
  return formatNumber(locale, value, {
    style: "currency",
    currency,
    ...options,
  })
}

/** Returns `null` for values that aren't a valid date. */
export function formatDate(
  locale: Locale,
  value: DateInput,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
): string | null {
  const date = toDate(value)
  if (!date) return null
  return cached(
    "date",
    locale,
    options,
    () => new Intl.DateTimeFormat(locale, options)
  ).format(date)
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
  ["second", 1],
]

/** "3 days ago", "in 2 hours". `now` is injectable for tests and prerendering. */
export function formatRelative(
  locale: Locale,
  value: DateInput,
  now: DateInput = Date.now()
): string | null {
  const date = toDate(value)
  const base = toDate(now)
  if (!date || !base) return null

  const seconds = Math.round((date.getTime() - base.getTime()) / 1000)
  const [unit, size] = UNITS.find(([, s]) => Math.abs(seconds) >= s) ?? [
    "second",
    1,
  ]
  const options = { numeric: "auto" } as const
  return cached(
    "relative",
    locale,
    options,
    () => new Intl.RelativeTimeFormat(locale, options)
  ).format(Math.round(seconds / size), unit)
}

export function formatList(
  locale: Locale,
  items: readonly string[],
  options: Intl.ListFormatOptions = { type: "conjunction" }
): string {
  return cached(
    "list",
    locale,
    options,
    () => new Intl.ListFormat(locale, options)
  ).format(items)
}
