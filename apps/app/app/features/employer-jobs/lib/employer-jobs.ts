import type { Job } from "../schemas/employer-jobs.schema"
import type { JobStatus } from "../types"

/** Ids go into request paths, so anything odd in a URL is a not-found. */
export const isJobId = (value: string | undefined): value is string =>
  /^[\w-]{1,64}$/.test(value ?? "")

/** Unapproved jobs show as pending whatever their own status says. */
export const statusOf = (job: Job): JobStatus => {
  if (job.job_status && job.job_status.toLowerCase() !== "approved")
    return "pending"
  const status = (job.status ?? "open").toLowerCase()
  return status === "paused" || status === "closed" ? status : "open"
}

export const capitalised = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1)

export const JOB_TABS = ["all", "open", "paused", "closed", "pending"] as const
