import type { Review } from "./schemas/candidate-onboarding.schema"

export interface Documents {
  profile_photo: File | null
  resignation_letter: File | null
  experience_letter: File | null
  present_offer: File | null
  notice_period_proof: File | null
  resume: File | null
}

export interface Resume {
  resumeId: string
  role: string
  otherReason: string
  review: Review
}
