import type { Tone } from "@/components/status-badge"

import type { Job } from "../schemas/employer-jobs.schema"
import type { JobStatus } from "../types"

export const statusTone: Record<JobStatus, Tone> = {
  open: "success",
  paused: "neutral",
  closed: "danger",
  pending: "warning",
}

// years as a range, max 0 for freshers, or null when not given
export function experienceOf(job: Job) {
  const min = job.experience_min_years
  const max = job.experience_max_years
  if (min != null && max != null) return { min, max }
  const parsed = /(\d+)\D+(\d+)/.exec(job.experience_required ?? "")
  return parsed ? { min: Number(parsed[1]), max: Number(parsed[2]) } : null
}

export const placeOf = (job: Job) => {
  const own = job.location?.trim()
  if (own) return own
  return [job.city, job.state, job.country].filter(Boolean).join(", ") || null
}

export const dateLabel = (iso: string | null | undefined, locale: string) => {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date)
}

// older jobs only have the text, e.g. "8 - 12 LPA" or "Up to 10 LPA"
export function salaryOf(job: Job) {
  const min = job.salary_min_lpa
  const max = job.salary_max_lpa
  if (min != null || max != null) return { min, max }
  const text = job.salary_range ?? ""
  const numbers = text.match(/\d+(?:\.\d+)?/g)?.map(Number)
  if (!numbers?.length) return null
  if (/^\s*up to\b/i.test(text)) return { min: null, max: numbers[0] ?? null }
  return { min: numbers[0] ?? null, max: numbers[1] ?? null }
}

export const shortDate = (
  iso: string | null | undefined,
  locale: string,
  now = new Date()
) => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  }).format(date)
}
