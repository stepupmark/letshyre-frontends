import { z } from "zod"

const text = z.string().nullish()

const texts = z.array(z.string()).nullish()

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
      : n
  })

const matchSchema = z.looseObject({
  candidate_id: z.union([z.string(), z.number()]).transform(String),
  candidate_name: text,
  profile_photo_url: text,
  score,
  ai_match: z
    .looseObject({
      ai_matching_score: score,
      role_match_score: score,
      skills_match_score: score,
      rationale: text,
      role_applied: text,
      years_experience: score,
      matched_skills: texts,
      missing_skills: texts,
    })
    .nullish(),
  interview_attempts: z
    .array(z.looseObject({ role: text, overall_score: score }))
    .nullish(),
})

export type Match = z.infer<typeof matchSchema>

export const matchesSchema = z.looseObject({
  matches: z.array(matchSchema).catch([]),
  total_candidates: z.number().nullish(),
  matched_candidates_count: z.number().nullish(),
})
