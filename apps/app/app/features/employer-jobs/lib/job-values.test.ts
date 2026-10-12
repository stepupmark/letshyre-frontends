import { describe, expect, it } from "vitest"

import { jobSchema, parsedJdSchema } from "../schemas/employer-jobs.schema"
import {
  EMPTY,
  fromJob,
  fromParsed,
  makeJobSchema,
  toCreateForm,
  type JobValues,
} from "./job-values"

const industries = [{ value: "it", label: "Information technology" }]
const messages = new Proxy({} as Parameters<typeof makeJobSchema>[0], {
  get: (_, key) => String(key),
})

const valid: JobValues = {
  ...EMPTY,
  title: "Senior React Developer",
  work_mode: "hybrid",
  employment_type: "full_time",
  industry: "it",
  skills: ["React"],
  openings: "2",
  salary_min: "18",
  salary_max: "28",
  experience_min: "4",
  experience_max: "7",
  state: "Telangana",
  city: "Hyderabad",
  education: "Any graduate",
  deadline: "2999-01-31",
  overview: "We build hiring software.",
  responsibilities: "Own the review screens\n\nMentor two developers ",
}

describe("fromParsed", () => {
  it("normalises what the AI read and marks only the fields it filled", () => {
    const { values, fromJd } = fromParsed(
      parsedJdSchema.parse({
        work_mode: "Work from office / On-site",
        employment_type: "Full-Time",
        industry_type: "information technology",
        required_skills: [" React ", "TypeScript"],
        application_deadline: "31-12-2026",
        responsibilities: ["Ship features", "  "],
        salary_min_lpa: "12",
      }),
      "Frontend Developer",
      industries
    )

    expect(values).toMatchObject({
      title: "Frontend Developer",
      work_mode: "on_site",
      employment_type: "full_time",
      industry: "it",
      skills: ["React", "TypeScript"],
      deadline: "2026-12-31",
      responsibilities: "Ship features",
      salary_min: "12",
      salary_max: "",
    })
    expect(Object.keys(fromJd).sort()).toEqual(
      [
        "deadline",
        "employment_type",
        "industry",
        "responsibilities",
        "salary_min",
        "skills",
        "work_mode",
      ].sort()
    )
  })
})

describe("toCreateForm", () => {
  it("sends the overview as the description, ranges as text and numbers, and the JD", () => {
    const jd = new File(["%PDF"], "jd.pdf", { type: "application/pdf" })
    const form = toCreateForm(valid, jd)
    const job = JSON.parse(form.get("file") as string) as Record<
      string,
      unknown
    >

    expect(form.get("title")).toBe("Senior React Developer")
    expect(form.get("jd_file")).toBe(jd)
    expect(job).toMatchObject({
      description: "We build hiring software.",
      responsibilities: ["Own the review screens", "Mentor two developers"],
      salary_range: "18 - 28 LPA",
      salary_min_lpa: 18,
      experience_required: "4-7 years",
      experience_max_years: 7,
      number_of_openings: 2,
      application_deadline: "2999-01-31",
      industry_type: "it",
    })
  })
})

describe("makeJobSchema", () => {
  it("rejects a maximum below the minimum and a past deadline on new jobs only", () => {
    const fresh = makeJobSchema(messages, { isNew: true })
    const edit = makeJobSchema(messages, { isNew: false })
    const swapped = { ...valid, salary_min: "30", salary_max: "20" }
    const past = { ...valid, deadline: "2020-01-01" }

    expect(fresh.safeParse(valid).success).toBe(true)
    expect(fresh.safeParse(swapped).error?.issues[0]).toMatchObject({
      path: ["salary_max"],
      message: "salaryOrder",
    })
    expect(fresh.safeParse(past).success).toBe(false)
    expect(edit.safeParse(past).success).toBe(true)
  })
})

describe("fromJob", () => {
  it("reads ranges from older jobs' text and treats 0–0 salary as not disclosed", () => {
    const values = fromJob(
      jobSchema.parse({
        id: 1,
        salary_min_lpa: 0,
        salary_max_lpa: 0,
        experience_required: "Up to 5 years",
        work_mode: "onsite",
      }),
      industries
    )
    expect(values).toMatchObject({
      salary_min: "",
      salary_max: "",
      experience_min: "",
      experience_max: "5",
      work_mode: "on_site",
    })
  })
})
