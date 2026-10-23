import type { Job } from "../schemas/employer-jobs.schema"
import { isJobId } from "./employer-jobs"
import { placeOf } from "./format"

export interface JobChoice {
  value: string
  label: string
  place: string | null
}

export const toChoice = (job: Job): JobChoice => ({
  value: job.id,
  label: job.title?.trim() ? job.title.trim() : job.id,
  place: placeOf(job),
})

export const chosenJob = (wanted: string | null, open: Job[]) => {
  const id = wanted ?? undefined
  return isJobId(id) ? id : open[0]?.id
}
