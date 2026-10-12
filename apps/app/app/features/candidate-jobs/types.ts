import type { STAGES } from "./lib/candidate-jobs"
import type { Job } from "./schemas/candidate-jobs.schema"

export interface JobSearch {
  q: string
  location: string
  type: string
  industry: string
  experience: string
  salary: string
  page: number
}

export interface JobsPage {
  jobs: Job[]
  total: number
  pages: number
}

export type Stage = (typeof STAGES)[number]
