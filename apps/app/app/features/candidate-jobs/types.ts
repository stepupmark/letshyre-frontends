import type { STAGES } from "./lib/candidate-jobs"
import type { EmploymentType, Sort } from "./lib/search"
import type { Job } from "./schemas/candidate-jobs.schema"

export interface JobSearch {
  q: string
  location: string
  types: EmploymentType[]
  industries: string[]
  experience: number | null
  pay: number | null
  hideApplied: boolean
  sort: Sort
  page: number
}

export interface JobsPage {
  jobs: Job[]
  total: number
  pages: number
}

export type Stage = (typeof STAGES)[number]
