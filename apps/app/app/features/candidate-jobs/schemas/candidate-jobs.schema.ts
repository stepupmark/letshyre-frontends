import { z } from "zod"

const text = z.string().nullish()

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
  employment_type: text,
  industry_type: text,
  experience_required: z.union([z.string(), z.number()]).nullish(),
  salary_range: text,
  skills_required: skills,
  description: text,
  created_at: text,
  // set once the candidate has applied
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
