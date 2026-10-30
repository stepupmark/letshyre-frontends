import { payloadOf } from "@workspace/api"
import { z } from "zod"

const text = z.string().nullish()

const num = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  })

const resultSchema = z.looseObject({
  candidate_id: z.union([z.string(), z.number()]).transform(String),
  candidate_name: text,
  candidate_profile_photo: text,
  candidate_location: text,
  candidate_education: z
    .array(z.looseObject({ degree: text, institution: text, duration: text }))
    .nullish()
    .catch(null),
  current_role: text,
  interviewed_role: text,
  interview_score: num,
  total_experience_years: num,
  completed_interviews_count: num,
  last_interview_date: text,
  skills_preview: z.array(z.string()).nullish().catch(null),
  interview_id: z.union([z.string(), z.number()]).nullish(),
  already_unlocked: z.boolean().nullish(),
})

export type SearchResult = z.infer<typeof resultSchema>

export const searchPageSchema = z.preprocess(
  payloadOf,
  z.looseObject({
    // one malformed row shouldn't make the whole page look empty
    results: z
      .array(z.unknown())
      .catch([])
      .transform((rows) =>
        rows.flatMap((row) => {
          const parsed = resultSchema.safeParse(row)
          return parsed.success ? [parsed.data] : []
        })
      ),
    count: num,
    total_pages: num,
  })
)
