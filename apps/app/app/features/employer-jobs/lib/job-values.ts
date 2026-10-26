import { z } from "zod"

export const WORK_MODES = ["on_site", "hybrid", "remote"] as const
export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "internship",
] as const

type Messages = Record<
  | "title"
  | "workMode"
  | "employmentType"
  | "industry"
  | "skills"
  | "openings"
  | "salary"
  | "salaryOrder"
  | "experience"
  | "experienceOrder"
  | "country"
  | "state"
  | "city"
  | "education"
  | "deadline"
  | "deadlinePast"
  | "overview"
  | "responsibilities",
  string
>

export const filled = (value: string) => value.trim() !== ""

export const makeJobSchema = (m: Messages, { isNew }: { isNew: boolean }) =>
  z
    .object({
      title: z.string().trim().min(2, m.title).max(150, m.title),
      work_mode: z.string().min(1, m.workMode),
      employment_type: z.string().min(1, m.employmentType),
      industry: z.string().min(1, m.industry),
      skills: z.array(z.string()).min(1, m.skills),
      openings: z
        .string()
        .refine(
          (v) => Number.isInteger(Number(v)) && Number(v) >= 1,
          m.openings
        ),
      salary_min: z.string(),
      salary_max: z.string(),
      experience_min: z.string(),
      experience_max: z.string(),
      country: z.string().trim().min(1, m.country),
      state: z.string().trim().min(1, m.state),
      city: z.string().trim().min(1, m.city),
      location: z.string(),
      education: z.string().trim().min(1, m.education),
      specialization: z.string(),
      deadline: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, m.deadline)
        .refine((v) => !isNew || v >= today(), m.deadlinePast),
      overview: z.string().trim().min(1, m.overview),
      responsibilities: z.string().trim().min(1, m.responsibilities),
    })
    .superRefine((values, ctx) => {
      checkRange(values.salary_min, values.salary_max, {
        limit: 500,
        whole: false,
        invalid: m.salary,
        order: m.salaryOrder,
        path: ["salary_min", "salary_max"],
        ctx,
      })
      checkRange(values.experience_min, values.experience_max, {
        limit: 50,
        whole: true,
        invalid: m.experience,
        order: m.experienceOrder,
        path: ["experience_min", "experience_max"],
        ctx,
      })
    })

function checkRange(
  min: string,
  max: string,
  {
    limit,
    whole,
    invalid,
    order,
    path,
    ctx,
  }: {
    limit: number
    whole: boolean
    invalid: string
    order: string
    path: [string, string]
    ctx: z.RefinementCtx
  }
) {
  let ok = true
  for (const [i, value] of [min, max].entries()) {
    if (!filled(value)) continue
    const n = Number(value)
    if (
      !Number.isFinite(n) ||
      n < 0 ||
      n > limit ||
      (whole && !Number.isInteger(n))
    ) {
      ctx.addIssue({ code: "custom", message: invalid, path: [path[i] ?? ""] })
      ok = false
    }
  }
  if (ok && filled(min) && filled(max) && Number(min) > Number(max))
    ctx.addIssue({ code: "custom", message: order, path: [path[1]] })
}

export type JobValues = z.infer<ReturnType<typeof makeJobSchema>>

export const today = () => new Date().toISOString().slice(0, 10)

export const EMPTY: JobValues = {
  title: "",
  work_mode: "",
  employment_type: "",
  industry: "",
  skills: [],
  openings: "1",
  salary_min: "",
  salary_max: "",
  experience_min: "",
  experience_max: "",
  country: "India",
  state: "",
  city: "",
  location: "",
  education: "",
  specialization: "",
  deadline: "",
  overview: "",
  responsibilities: "",
}

// The API also keeps a text version of each range; candidate screens show it.
const rangeText = (min: string, max: string, sep: string, unit: string) => {
  if (filled(min) && filled(max)) return `${min}${sep}${max} ${unit}`
  if (filled(min)) return `${min} ${unit}`
  if (filled(max)) return `Up to ${max} ${unit}`
  return ""
}
export const salaryText = (min: string, max: string) =>
  rangeText(min, max, " - ", "LPA")
export const experienceText = (min: string, max: string) =>
  rangeText(min, max, "-", "years")
