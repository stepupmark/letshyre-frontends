import type { Tone } from "@/components/status-badge"

import type { Job, JobStatus } from "./api"

export const statusTone: Record<JobStatus, Tone> = {
  open: "success",
  paused: "neutral",
  closed: "danger",
  pending: "warning",
}

/** Years as "3–5", "0" for freshers, or null when not given. */
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
