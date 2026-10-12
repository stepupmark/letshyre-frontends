import type { JOB_TABS } from "./lib/employer-jobs"

export type JobStatus = "open" | "paused" | "closed" | "pending"

export type JobTab = (typeof JOB_TABS)[number]
