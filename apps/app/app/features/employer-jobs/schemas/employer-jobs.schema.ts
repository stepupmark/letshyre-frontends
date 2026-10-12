import { z } from "zod"

const text = z.string().nullish()

export const id = z.union([z.string(), z.number()]).transform(String)

// numbers arrive as numbers, numeric strings or null
const num = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  })

const list = z
  .union([z.array(z.string()), z.string()])
  .nullish()
  .transform((value) =>
    Array.isArray(value)
      ? value
      : (value ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
  )

export const jobSchema = z.looseObject({
  id,
  title: text,
  status: text,
  job_status: text,
  job_posted_date: text,
  work_mode: text,
  employment_type: text,
  industry_type: text,
  location: text,
  city: text,
  state: text,
  country: text,
  salary_range: text,
  salary_min_lpa: num,
  salary_max_lpa: num,
  experience_required: text,
  experience_min_years: num,
  experience_max_years: num,
  number_of_openings: num,
  application_deadline: text,
  deadline: text,
  description: text,
  responsibilities: z
    .union([z.array(z.string()), z.string()])
    .nullish()
    .transform((value) =>
      Array.isArray(value)
        ? value
        : (value ?? "").split("\n").filter((line) => line.trim())
    ),
  skills_required: list,
  minimum_education: text,
  specialization: text,
  jd_file_url: text,
  ai_generated_jd: z.boolean().nullish(),
})

export type Job = z.infer<typeof jobSchema>

export const jobsPageSchema = z.looseObject({
  results: z.array(jobSchema).catch([]),
  count: z.number().nullish(),
  total_pages: z.number().nullish(),
})

export const parsedJdSchema = z.looseObject({
  job_title: text,
  work_mode: text,
  employment_type: text,
  industry_type: text,
  required_skills: z.array(z.string()).nullish(),
  skills_text: text,
  salary_min_lpa: num,
  salary_max_lpa: num,
  experience_min: num,
  experience_max: num,
  country: text,
  state: text,
  city: text,
  location: text,
  minimum_education: text,
  specialization: text,
  responsibilities: z.union([z.array(z.string()), z.string()]).nullish(),
  job_description: text,
  number_of_openings: num,
  application_deadline: text,
})

export type ParsedJd = z.infer<typeof parsedJdSchema>
