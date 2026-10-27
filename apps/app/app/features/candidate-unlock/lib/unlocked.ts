import type { Unlocked } from "../schemas/candidate-unlock.schema"

export const roleOf = (row: Unlocked) =>
  Object.keys(row.candidate_tech_experience ?? {})[0] ??
  row.candidate_experience?.[0]?.role ??
  null

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

// one decimal, so 4.6 never shows as "5 yrs" and slips past a 5+ filter
export const experienceOf = (years: number | null) => {
  if (years == null || years <= 0) return null
  return years < 1 ? ("under" as const) : Math.round(years * 10) / 10
}

const lpa = (n: number) =>
  Number.isInteger(n) ? String(n) : (Math.round(n * 10) / 10).toString()

export const payOf = (row: Unlocked) => {
  const { candidate_current_ctc: now, candidate_expected_ctc: next } = row
  if (now == null && next == null) return null
  return {
    now: now == null ? null : lpa(now),
    next: next == null ? null : lpa(next),
  }
}

export const placeOf = (row: Unlocked) => {
  const place = row.candidate_location?.replace(/\s*,\s*/g, ", ").trim()
  return place === "" ? null : (place ?? null)
}

export const unlockedOn = (row: Unlocked, locale: string, now = new Date()) => {
  const when = new Date(row.unlocked_date ?? "")
  if (Number.isNaN(when.getTime())) return null
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: when.getFullYear() === now.getFullYear() ? undefined : "numeric",
  }).format(when)
}
