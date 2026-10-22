import type { Job } from "../schemas/candidate-jobs.schema"

const DAY = 86_400_000
const NEW_FOR_DAYS = 3
const CLOSING_IN_DAYS = 7

const numberOf = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)

const span = (
  min: number | null | undefined,
  max: number | null | undefined,
  locale: string
) => {
  const low = min ?? max
  const high = max ?? min
  if (low == null || high == null) return null
  return low === high
    ? numberOf(low, locale)
    : `${numberOf(low, locale)}–${numberOf(high, locale)}`
}

const tidy = (raw: string, unit: RegExp) =>
  raw
    .replace(unit, "")
    .replace(/\s*-\s*/, "–")
    .trim() || null

/** "2–5", "3" or "0"; the caller adds the unit. */
export const experienceOf = (job: Job, locale: string) =>
  span(job.experience_min_years, job.experience_max_years, locale) ??
  (job.experience_required == null
    ? null
    : tidy(String(job.experience_required), /\s*(years?|yrs?)$/i))

/** "8–14" in lakhs a year; the caller adds the unit. */
export const salaryOf = (job: Job, locale: string) =>
  span(job.salary_min_lpa, job.salary_max_lpa, locale) ??
  (job.salary_range ? tidy(job.salary_range, /\s*lpa$/i) : null)

export const isNew = (job: Job, now = Date.now()) => {
  const posted = job.created_at ? Date.parse(job.created_at) : Number.NaN
  return Number.isFinite(posted) && now - posted < NEW_FOR_DAYS * DAY
}

/** Whole days until the deadline closes, when that's within a week. */
export const closingInDays = (job: Job, now = Date.now()) => {
  if (!job.deadline) return null
  const end = Date.parse(`${job.deadline.slice(0, 10)}T23:59:59`)
  if (!Number.isFinite(end) || end < now) return null
  const days = Math.floor((end - now) / DAY)
  return days < CLOSING_IN_DAYS ? days : null
}

const STATUSES = [
  "Applied",
  "Shortlisted",
  "Reserved",
  "Selected",
  "Hired",
  "Rejected",
] as const
export type Status = (typeof STATUSES)[number]

export const statusOf = (raw: string | null | undefined): Status | null => {
  if (!raw) return null
  return (
    STATUSES.find((status) => status.toLowerCase() === raw.toLowerCase()) ??
    "Applied"
  )
}
