import { z } from "zod"

// scores arrive as numbers or numeric strings
const score = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((value) => {
    const n = Number(value)
    return value === null ||
      value === undefined ||
      value === "" ||
      !Number.isFinite(n)
      ? null
      : Math.round(n)
  })

const text = z.string().nullish()
const texts = z.array(z.string()).nullish()

const question = z.looseObject({
  type: text,
  question_text: text,
  answer_provided: text,
  is_correct: z.boolean().nullish(),
  options: texts,
  correct_answer: text,
  candidate_audio_file_url: text,
  is_dummy_audio: z.boolean().nullish(),
  feedback: text,
})

const section = z.looseObject({
  count: z.number().nullish(),
  correct: z.number().nullish(),
  section_score: score,
})

const named = z.union([
  z.string(),
  z.looseObject({ name: text, title: text, issuer: text }),
])

// one shape for the shared link, the employer's copy and the candidate's own
export const scorecardSchema = z
  .looseObject({
    shared_by_company_name: text,
    candidate_name: text,
    candidate_role: text,
    candidate_profile_photo: text,
    candidate_location: text,
    candidate_total_experience_years: score,
    matched_job_title: text,
    overall_score: score,
    created_at: text,
    interview_video: text,
    candidate_interview_video: text,
    ai_match: z
      .looseObject({
        ai_matching_score: score,
        role_match_score: score,
        skills_match_score: score,
        rationale: text,
      })
      .nullish(),
    category_scores: z
      .looseObject({
        candidate_role: text,
        question_breakdown: z.array(question).nullish(),
        comm_metrics: z.record(z.string(), score).nullish(),
        section_summary: z.record(z.string(), section).nullish(),
        strengths: texts,
        areas_for_improvement: texts,
        recommendations: texts,
      })
      .nullish(),
    candidate_skills: texts,
    candidate_education: z
      .array(z.looseObject({ institution: text, degree: text, duration: text }))
      .nullish(),
    candidate_experience: z
      .array(
        z.looseObject({
          role: text,
          company: text,
          duration: text,
          description: text,
        })
      )
      .nullish(),
    candidate_projects: z
      .array(z.looseObject({ title: text, name: text, description: text }))
      .nullish(),
    candidate_certifications: z.array(named).nullish(),
    candidate_accomplishments: z.array(named).nullish(),
    candidate_portfolio_links: texts,
    candidate_resume: text,
  })
  .transform((report) => ({
    ...report,
    candidate_role:
      report.category_scores?.candidate_role ?? report.candidate_role,
    interview_video: report.interview_video ?? report.candidate_interview_video,
  }))

export type Scorecard = z.infer<typeof scorecardSchema>
export type Question = z.infer<typeof question>
