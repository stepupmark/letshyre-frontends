import { z } from "zod"

const text = z.string().nullish()

const amount = z.preprocess(
  (value) => (typeof value === "string" ? Number.parseFloat(value) : value),
  z.number().nullish().catch(null)
)

const skills = z.preprocess(
  (value) =>
    typeof value === "string"
      ? value
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : value,
  z.array(z.string()).catch([]).nullish()
)

const jobSchema = z.looseObject({
  id: z.union([z.string(), z.number()]).transform(String),
  title: text,
  company_name: text,
  company_logo: text,
  employer: z
    .union([
      z.string(),
      z.looseObject({
        company_name: text,
        company_logo: text,
        kyc: z.looseObject({ company_logo: text }).nullish(),
      }),
    ])
    .nullish(),
  location: text,
  city: text,
  work_mode: text,
  employment_type: text,
  industry_type: text,
  experience_required: z.union([z.string(), z.number()]).nullish(),
  experience_min_years: amount,
  experience_max_years: amount,
  salary_range: text,
  salary_min_lpa: amount,
  salary_max_lpa: amount,
  skills_required: skills,
  number_of_openings: amount,
  deadline: text,
  description: text,
  created_at: text,
  applied_at: text,
  // the candidate's application stage, null until they apply
  status: text,
})

export type Job = z.infer<typeof jobSchema>

const page = z.looseObject({
  results: z.array(jobSchema).catch([]),
  count: z.number().nullish(),
  total_pages: z.number().nullish(),
  next: z.string().nullish(),
})

export const jobsPageSchema = z.preprocess(
  (value) => (Array.isArray(value) ? { results: value } : value),
  page
)
