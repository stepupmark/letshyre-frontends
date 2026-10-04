import type { Review } from "./api"

export interface ResumeState {
  file: File | null
  fileName: string
  jobId: string | null
  resumeId: string
  roles: string[]
  role: string
  custom: boolean
  otherReason: string
  review: Review | null
}

export const EMPTY_RESUME: ResumeState = {
  file: null,
  fileName: "",
  jobId: null,
  resumeId: "",
  roles: [],
  role: "",
  custom: false,
  otherReason: "",
  review: null,
}
