import { z } from "zod"

import type { Job, ParsedJd } from "./api"

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

const filled = (value: string) => value.trim() !== ""

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

const has = (value: string) => filled(value)

// The API also keeps a text version of each range; candidate screens show it.
const rangeText = (min: string, max: string, sep: string, unit: string) => {
  if (has(min) && has(max)) return `${min}${sep}${max} ${unit}`
  if (has(min)) return `${min} ${unit}`
  if (has(max)) return `Up to ${max} ${unit}`
  return ""
}
export const salaryText = (min: string, max: string) =>
  rangeText(min, max, " - ", "LPA")
export const experienceText = (min: string, max: string) =>
  rangeText(min, max, "-", "years")

/** Numbers back out of an older job's text, e.g. "10 - 15 LPA" or "Up to 5 years". */
function parseRange(text: string | null | undefined) {
  const numbers = (text ?? "").match(/\d+(?:\.\d+)?/g)
  if (!numbers?.length) return null
  if (/^\s*up to\b/i.test(text ?? "")) return { min: "", max: numbers[0] }
  return { min: numbers[0], max: numbers[1] ?? "" }
}

const str = (n: number | null | undefined) => (n == null ? "" : String(n))

const workModeOf = (raw: string | null | undefined) => {
  const value = (raw ?? "").toLowerCase()
  if (value.includes("remote")) return "remote"
  if (value.includes("hybrid")) return "hybrid"
  if (/site|office/.test(value)) return "on_site"
  return ""
}

const employmentOf = (raw: string | null | undefined) => {
  const value = (raw ?? "").toLowerCase()
  if (value.includes("full")) return "full_time"
  if (value.includes("part")) return "part_time"
  if (value.includes("contract")) return "contract"
  if (value.includes("intern")) return "internship"
  return ""
}

/** dd-mm-yyyy or yyyy-mm-dd to yyyy-mm-dd; anything else is dropped. */
const dateOf = (raw: string | null | undefined) => {
  const value = (raw ?? "").trim().slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parts = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value)
  return parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : ""
}

export interface Industry {
  value: string
  label: string
}

const industryOf = (raw: string | null | undefined, industries: Industry[]) => {
  const value = (raw ?? "").trim().toLowerCase()
  if (!value) return ""
  const match =
    industries.find(
      (i) => i.value.toLowerCase() === value || i.label.toLowerCase() === value
    ) ??
    industries.find(
      (i) =>
        i.label.toLowerCase().includes(value) ||
        value.includes(i.label.toLowerCase())
    )
  return match?.value ?? ""
}

const lines = (value: string[] | string | null | undefined) =>
  (Array.isArray(value) ? value : (value ?? "").split("\n"))
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")

/**
 * The form filled from a parsed JD, plus what the JD filled so the form can
 * mark those fields for checking.
 */
export function fromParsed(
  jd: ParsedJd,
  typedTitle: string,
  industries: Industry[]
): { values: JobValues; fromJd: Partial<JobValues> } {
  const found: Partial<JobValues> = {
    title: jd.job_title?.trim() ?? "",
    work_mode: workModeOf(jd.work_mode),
    employment_type: employmentOf(jd.employment_type),
    industry: industryOf(jd.industry_type, industries),
    skills:
      jd.required_skills?.map((s) => s.trim()).filter(Boolean) ??
      (jd.skills_text ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    openings: jd.number_of_openings ? str(jd.number_of_openings) : "",
    salary_min: str(jd.salary_min_lpa),
    salary_max: str(jd.salary_max_lpa),
    experience_min: str(jd.experience_min),
    experience_max: str(jd.experience_max),
    country: jd.country?.trim() ?? "",
    state: jd.state?.trim() ?? "",
    city: jd.city?.trim() ?? "",
    location: jd.location?.trim() ?? "",
    education: jd.minimum_education?.trim() ?? "",
    specialization: jd.specialization?.trim() ?? "",
    deadline: dateOf(jd.application_deadline),
    overview: jd.job_description?.trim() ?? "",
    responsibilities: lines(jd.responsibilities),
  }
  const fromJd = Object.fromEntries(
    Object.entries(found).filter(([, value]) =>
      Array.isArray(value) ? value.length > 0 : value !== ""
    )
  ) as Partial<JobValues>
  return {
    values: { ...EMPTY, title: typedTitle.trim(), ...fromJd },
    fromJd,
  }
}

/** A saved job as form values; older jobs may only have range text. */
export function fromJob(job: Job, industries: Industry[]): JobValues {
  const salary =
    job.salary_min_lpa != null || job.salary_max_lpa != null
      ? { min: str(job.salary_min_lpa), max: str(job.salary_max_lpa) }
      : (parseRange(job.salary_range) ?? { min: "", max: "" })
  // 0–0 means not disclosed
  const undisclosed = Number(salary.min) === 0 && Number(salary.max) === 0
  const experience =
    job.experience_min_years != null || job.experience_max_years != null
      ? {
          min: str(job.experience_min_years),
          max: str(job.experience_max_years),
        }
      : (parseRange(job.experience_required) ?? { min: "", max: "" })

  return {
    title: job.title ?? "",
    work_mode: workModeOf(job.work_mode),
    employment_type: employmentOf(job.employment_type),
    industry:
      industryOf(job.industry_type, industries) || (job.industry_type ?? ""),
    skills: job.skills_required,
    openings: str(job.number_of_openings ?? 1),
    salary_min: undisclosed ? "" : salary.min,
    salary_max: undisclosed ? "" : salary.max,
    experience_min: experience.min,
    experience_max: experience.max,
    country: job.country ?? "",
    state: job.state ?? "",
    city: job.city ?? "",
    location: job.location ?? "",
    education: job.minimum_education ?? "",
    specialization: job.specialization ?? "",
    deadline: dateOf(job.application_deadline ?? job.deadline),
    overview: job.description ?? "",
    responsibilities: lines(job.responsibilities),
  }
}

const numberOrNull = (value: string) => (has(value) ? Number(value) : null)

/** What both create and update send; field names follow the API. */
export function toPayload(values: JobValues) {
  return {
    title: values.title.trim(),
    work_mode: values.work_mode,
    employment_type: values.employment_type,
    industry_type: values.industry,
    skills_required: values.skills,
    number_of_openings: Number(values.openings),
    salary_range: salaryText(values.salary_min, values.salary_max),
    salary_min_lpa: numberOrNull(values.salary_min),
    salary_max_lpa: numberOrNull(values.salary_max),
    experience_required: experienceText(
      values.experience_min,
      values.experience_max
    ),
    experience_min_years: numberOrNull(values.experience_min),
    experience_max_years: numberOrNull(values.experience_max),
    country: values.country.trim(),
    state: values.state.trim(),
    city: values.city.trim(),
    location: values.location.trim(),
    minimum_education: values.education.trim(),
    specialization: values.specialization.trim(),
    deadline: values.deadline,
    application_deadline: values.deadline,
    description: values.overview.trim(),
    responsibilities: values.responsibilities
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  }
}

/** Create goes as multipart: the job as JSON in `file`, the JD beside it. */
export function toCreateForm(values: JobValues, jd: File | null) {
  const form = new FormData()
  form.append("title", values.title.trim())
  form.append(
    "file",
    JSON.stringify({
      ...toPayload(values),
      // the create endpoint reads the older name
      education_required: values.education.trim(),
      is_active: true,
    })
  )
  if (jd) form.append("jd_file", jd)
  return form
}
