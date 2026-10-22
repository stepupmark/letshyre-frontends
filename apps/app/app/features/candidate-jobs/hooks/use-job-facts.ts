import { useLocale, useTranslation } from "@workspace/i18n/react"

import { experienceOf, salaryOf } from "../lib/job-facts"
import { type Job } from "../schemas/candidate-jobs.schema"

const humanize = (value: string) =>
  value.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())

export function useJobFacts(job: Job) {
  const { t } = useTranslation("candidateJobs")
  const locale = useLocale()
  const years = experienceOf(job, locale)
  const pay = salaryOf(job, locale)
  const place = job.location ?? job.city
  const mode = job.work_mode
    ? t(`workModes.${job.work_mode.toLowerCase()}` as "workModes.hybrid", {
        defaultValue: humanize(job.work_mode),
      })
    : null
  return {
    experience:
      years === null
        ? null
        : years === "0"
          ? t("facts.fresher")
          : t("facts.years", { years }),
    salary: pay === null ? null : t("facts.salary", { amount: pay }),
    location:
      place && mode && place.toLowerCase() !== job.work_mode?.toLowerCase()
        ? `${place} · ${mode}`
        : (place ?? mode),
    type: job.employment_type
      ? t(`types.${job.employment_type}` as "types.full_time", {
          defaultValue: humanize(job.employment_type),
        })
      : null,
  }
}
