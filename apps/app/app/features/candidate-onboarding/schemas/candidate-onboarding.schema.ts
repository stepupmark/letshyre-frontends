import { z } from "zod"

const text = z
  .string()
  .nullish()
  .transform((v) => v ?? "")

export const reviewSchema = z.looseObject({
  skills: z.array(z.string()).catch([]),
  certifications: z.array(z.unknown()).catch([]),
  education: z
    .array(z.looseObject({ institution: text, degree: text, duration: text }))
    .catch([]),
  experience: z
    .array(
      z.looseObject({
        role: text,
        company: text,
        duration: text,
        description: text,
      })
    )
    .catch([]),
  projects: z
    .array(z.looseObject({ title: text, description: text }))
    .catch([]),
})

export type Review = z.infer<typeof reviewSchema>

export const statusSchema = z.looseObject({
  status: z.string(),
  ai_resume_id: z.union([z.string(), z.number()]).nullish(),
  error_message: z.string().nullish(),
  suggested_roles: z
    .looseObject({
      suggested_roles: z.array(z.string()).nullish(),
      roles: z.array(z.string()).nullish(),
    })
    .nullish(),
})

export const skillsSchema = z.looseObject({
  needs_clarification: z.boolean().nullish(),
  suggestions: z.array(z.string()).nullish(),
  skills: z.array(z.string()).nullish(),
})

export const meSchema = z.looseObject({
  is_profile_complete: z.boolean().nullish(),
})
