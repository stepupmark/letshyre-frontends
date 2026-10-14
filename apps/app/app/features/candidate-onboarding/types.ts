import type { Review } from "./schemas/candidate-onboarding.schema"

export interface Resume {
  file: File | null
  resumeId: string
  role: string
  otherReason: string
  review: Review
}
