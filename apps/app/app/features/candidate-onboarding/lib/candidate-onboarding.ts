import type { Review } from "../schemas/candidate-onboarding.schema"
import { joinAddress, type Values } from "../schemas/onboarding-form.schema"
import type { Resume } from "../types"

/** "2 years 6 months" → 2.5, summed across every job. */
const yearsOf = (experience: Review["experience"]) =>
  experience.reduce((sum, job) => {
    const years = /(\d+)\s*year/i.exec(job.duration)?.[1]
    const months = /(\d+)\s*month/i.exec(job.duration)?.[1]
    return sum + Number(years ?? 0) + Number(months ?? 0) / 12
  }, 0)

/** The multipart body the API expects; it spells "prof" its own way. */
export function profileForm(values: Values, resume: Resume) {
  const form = new FormData()
  const put = (key: string, value: string | Blob | null) => {
    if (value !== null) form.append(key, value)
  }
  put("gender", values.gender)
  put("dob", values.dob)
  put("aadhar_number", values.aadhar_number.replace(/\D/g, ""))
  put("location", values.address_city)
  put("address", joinAddress(values))
  put("profile_photo", values.profile_photo)
  put("present_or_last_working_company", values.present_or_last_working_company)
  put("last_day_of_working", values.last_day_of_working)
  put("current_ctc", values.current_ctc)
  put("expected_ctc", values.expected_ctc)
  put("desired_ctc", values.desired_ctc)
  put("preferred_industry", values.preferred_industry)
  put("preferred_locations", JSON.stringify(values.preferred_locations))
  put("resignation_letter", values.resignation_letter)
  put("experience_letter", values.experience_letter)
  put("present_offer", values.present_offer ?? null)
  put("notice_period_prof_type", values.notice_period_proof_type)
  put("notice_period_prof", values.notice_period_proof)
  put("resume", resume.file)
  put("resume_id", resume.resumeId)
  put("role", resume.role)
  put("selected_role", resume.role)
  put("role_other_reason", resume.otherReason)
  const { review } = resume
  put("parsed_resume_data", JSON.stringify(review))
  put("education", JSON.stringify(review.education))
  put("experience", JSON.stringify(review.experience))
  put("projects", JSON.stringify(review.projects))
  put("certifications", JSON.stringify(review.certifications))
  put("total_experience_years", yearsOf(review.experience).toFixed(1))
  const byRole: Record<string, number> = {}
  for (const job of review.experience)
    if (job.role) byRole[job.role] = (byRole[job.role] ?? 0) + 1
  put("tech_experience", JSON.stringify(byRole))
  put("profile_completion_score", "100")
  put("is_profile_complete", "true")
  return form
}
