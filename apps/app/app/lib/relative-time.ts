const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 86_400_000],
  ["month", 30 * 86_400_000],
  ["week", 7 * 86_400_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
]

export function relativeTime(iso: string, locale = "en") {
  const diff = new Date(iso).getTime() - Date.now()
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms) return format.format(Math.round(diff / ms), unit)
  }
  return format.format(0, "minute")
}
