const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
})

const currencyFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
})

const compactCurrencyFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
})

const numberFormat = new Intl.NumberFormat("en-IN")

const shortDateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
})

function toDate(value: string | number | Date | null | undefined) {
  if (value === null || value === undefined || value === "") return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value: string | Date | null | undefined) {
  const date = toDate(value)
  return date ? dateFormat.format(date) : "—"
}

export function formatDateTime(value: string | Date | null | undefined) {
  const date = toDate(value)
  return date ? dateTimeFormat.format(date) : "—"
}

const relativeFormat = new Intl.RelativeTimeFormat("en-IN", {
  numeric: "auto",
})

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
]

export const isDateOnly = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

export function formatRelative(value: string | null | undefined) {
  if (!value) return "—"
  if (isDateOnly(value)) {
    const [year = 0, month = 1, day = 1] = value.split("-").map(Number)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const days = Math.round(
      (new Date(year, month - 1, day).getTime() - today.getTime()) / 86_400_000
    )
    if (Math.abs(days) < 7) return relativeFormat.format(days, "day")
  }
  const date = toDate(value)
  if (!date) return "—"
  const seconds = (date.getTime() - Date.now()) / 1000
  const unit = RELATIVE_UNITS.find(([, size]) => Math.abs(seconds) >= size)
  return unit
    ? relativeFormat.format(Math.round(seconds / unit[1]), unit[0])
    : "just now"
}

export function formatCurrency(
  value: number | string | null | undefined,
  currency?: string | null
) {
  const amount = Number(value)
  if (value === null || value === undefined || value === "" || isNaN(amount))
    return "—"
  if (!currency || currency === "INR") return currencyFormat.format(amount)
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(amount)
  } catch {
    return `${currency} ${amount}`
  }
}

export function formatCompactCurrency(value: number) {
  return compactCurrencyFormat.format(value)
}

export function formatShortDate(value: string | null | undefined) {
  const date = toDate(value)
  return date ? shortDateFormat.format(date) : "—"
}

export function percentChange(current: number, previous: number) {
  return previous > 0 ? ((current - previous) / previous) * 100 : null
}

export function formatNumber(value: number | string | null | undefined) {
  const n = Number(value)
  return value === null || value === undefined || Number.isNaN(n)
    ? "—"
    : numberFormat.format(n)
}

/** Keeps the last few characters visible, e.g. "XXXX XXXX 1234". */
export function maskId(value: string | null | undefined, visible = 4) {
  const clean = value?.replace(/\s+/g, "") ?? ""
  if (!clean) return "—"
  if (clean.length <= visible) return clean
  return `${"•".repeat(clean.length - visible)}${clean.slice(-visible)}`
}

export function initials(name: string | null | undefined, fallback = "?") {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean)
  return parts.length
    ? parts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : fallback
}

/** ISO string to the local "YYYY-MM-DDTHH:mm" value a datetime-local input expects. */
export function toDateTimeLocal(value: string | null | undefined) {
  const date = toDate(value)
  if (!date) return ""
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}
