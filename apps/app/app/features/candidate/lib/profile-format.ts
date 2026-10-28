// numbers without a country code are Indian
export function phoneOf(raw: string | number | null | undefined) {
  const digits = String(raw ?? "").trim()
  if (!digits) return null
  return digits.startsWith("+") ? digits : `+91 ${digits}`
}

/** Older profiles store the address as an object of parts, which often repeat the city. */
export function addressOf(raw: unknown): string | null {
  if (typeof raw === "string") return raw.trim() || null
  if (raw && typeof raw === "object")
    return (
      [
        ...new Set(
          Object.values(raw)
            .filter((part): part is string => typeof part === "string")
            .map((part) => part.trim())
            .filter(Boolean)
        ),
      ].join(", ") || null
    )
  return null
}

/** Lakhs to at most two decimals, the same precision the pay form accepts. */
export const lpaOf = (n: number) => String(Math.round(n * 100) / 100)

export type Notice =
  | { kind: "unknown" }
  | { kind: "now" }
  | { kind: "days"; days: number }
  | { kind: "text"; text: string }

/** The API sends days as a number, a numeric string, or free text. */
export function noticeOf(raw: string | number | null | undefined): Notice {
  if (raw == null || String(raw).trim() === "") return { kind: "unknown" }
  const text = String(raw).trim()
  if (!/^\d+$/.test(text)) return { kind: "text", text }
  const days = Number(text)
  return days === 0 ? { kind: "now" } : { kind: "days", days }
}

type Named =
  | string
  | { name?: string | null; title?: string | null; issuer?: string | null }

export const titleOf = (item: Named) =>
  typeof item === "string"
    ? { title: item, issuer: null }
    : { title: item.name ?? item.title ?? "", issuer: item.issuer ?? null }

/** Skills as plain names, without repeats. */
export const skillsOf = (skills: Named[] | null | undefined) => [
  ...new Set(
    (skills ?? []).map((skill) => titleOf(skill).title).filter(Boolean)
  ),
]

const YEARS = /^(\d+(?:\.\d+)?)\s*(?:years?|yrs?)$/i

// resume parsing sends tenure as decimal years ("0.11 years"); anything else is the candidate's own words
export function durationOf(raw: string | null | undefined, locale: string) {
  const text = raw?.trim()
  if (!text) return null
  const match = YEARS.exec(text)
  if (!match) return text
  const years = Number(match[1])
  const unit = (unit: "month" | "year", n: number) =>
    new Intl.NumberFormat(locale, {
      style: "unit",
      unit,
      unitDisplay: "long",
      maximumFractionDigits: 1,
    }).format(n)
  return years < 1
    ? unit("month", Math.max(1, Math.round(years * 12)))
    : unit("year", Math.round(years * 10) / 10)
}

export const placeOf = (raw: string | null | undefined) => {
  const place = raw?.trim().replace(/\s*,\s*/g, ", ")
  return place?.length ? place : null
}
