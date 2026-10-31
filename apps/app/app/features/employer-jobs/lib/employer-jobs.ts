import type { FileRules } from "@/lib/file-rules"

import type { Job } from "../schemas/employer-jobs.schema"
import type { JobStatus } from "../types"

// ids go into request paths, so anything odd in a URL is a not-found
export const isJobId = (value: string | undefined): value is string =>
  /^[\w-]{1,64}$/.test(value ?? "")

// unapproved jobs show as pending whatever their own status says
export const statusOf = (job: Job): JobStatus => {
  if (job.job_status && job.job_status.toLowerCase() !== "approved")
    return "pending"
  const status = (job.status ?? "open").toLowerCase()
  return status === "paused" || status === "closed" ? status : "open"
}

// the status a job can be set back to; pending is the approval, not a status
export const ownStatus = (job: Job): Exclude<JobStatus, "pending"> => {
  const status = (job.status ?? "open").toLowerCase()
  return status === "paused" || status === "closed" ? status : "open"
}

// statuses that would change at least one selected job; pending jobs are left alone
export function bulkTargets(jobs: Job[], ids: string[]) {
  const picked = jobs.filter((job) => ids.includes(job.id))
  const movable = picked.filter((job) => statusOf(job) !== "pending")
  const targets = (["open", "paused", "closed"] as const).filter((status) =>
    movable.some((job) => ownStatus(job) !== status)
  )
  return { targets, movable, pending: picked.length - movable.length }
}

export const capitalised = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1)

export const JOB_TABS = ["all", "open", "paused", "closed"] as const

export const JD_RULES: FileRules = {
  accept: [".pdf", ".doc", ".docx"],
  maxBytes: 5 * 1024 * 1024,
}
