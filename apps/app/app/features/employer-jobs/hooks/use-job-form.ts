import { zodResolver } from "@hookform/resolvers/zod"
import { HttpError } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import { useMemo } from "react"
import { useForm, type FieldPath } from "react-hook-form"

import { EMPTY, makeJobSchema, type JobValues } from "../lib/job-values"

// API field names that map to a form field
const SERVER_FIELDS: Record<string, FieldPath<JobValues>> = {
  title: "title",
  work_mode: "work_mode",
  employment_type: "employment_type",
  industry_type: "industry",
  skills_required: "skills",
  number_of_openings: "openings",
  salary_min_lpa: "salary_min",
  salary_max_lpa: "salary_max",
  experience_min_years: "experience_min",
  experience_max_years: "experience_max",
  country: "country",
  state: "state",
  city: "city",
  minimum_education: "education",
  deadline: "deadline",
  application_deadline: "deadline",
  description: "overview",
  responsibilities: "responsibilities",
}

export function useJobForm(
  defaultValues: JobValues,
  { isNew }: { isNew: boolean }
) {
  const { t } = useTranslation("jobs")
  const schema = useMemo(
    () =>
      makeJobSchema(
        {
          title: t("validation.title"),
          workMode: t("validation.workMode"),
          employmentType: t("validation.employmentType"),
          industry: t("validation.industry"),
          skills: t("validation.skills"),
          openings: t("validation.openings"),
          salary: t("validation.salary"),
          salaryOrder: t("validation.salaryOrder"),
          experience: t("validation.experience"),
          experienceOrder: t("validation.experienceOrder"),
          country: t("validation.country"),
          state: t("validation.state"),
          city: t("validation.city"),
          education: t("validation.education"),
          deadline: t("validation.deadline"),
          deadlinePast: t("validation.deadlinePast"),
          overview: t("validation.overview"),
          responsibilities: t("validation.responsibilities"),
        },
        { isNew }
      ),
    [t, isNew]
  )
  const form = useForm<JobValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...EMPTY, ...defaultValues },
    mode: "onSubmit",
  })

  /** Puts the server's field errors on their fields; true if any landed. */
  const showServerErrors = (error: unknown) => {
    const fields = error instanceof HttpError ? error.fieldErrors : undefined
    let first: FieldPath<JobValues> | undefined
    for (const [key, message] of Object.entries(fields ?? {})) {
      const name = SERVER_FIELDS[key]
      if (!name) continue
      form.setError(name, { message })
      first ??= name
    }
    if (first) form.setFocus(first)
    return Boolean(first)
  }

  return { form, showServerErrors }
}
