import { useTranslation } from "@workspace/i18n/react"
import { useMemo } from "react"

import { experienceOf, salaryOf } from "../lib/format"
import { EMPLOYMENT_TYPES, WORK_MODES } from "../lib/job-values"
import type { Job } from "../schemas/employer-jobs.schema"

const isOneOf = (list: readonly string[], value: string) => list.includes(value)

// the labels a row shows, so the table and the phone card read the same
export function useJobFacts() {
  const { t } = useTranslation("jobs")

  return useMemo(() => {
    const years = (job: Job) => {
      const range = experienceOf(job)
      if (!range) return null
      if (range.max === 0) return t("fresher")
      return range.min === range.max
        ? t("yearsExact", { count: range.min })
        : t("years", range)
    }

    const salary = (job: Job) => {
      const range = salaryOf(job)
      if (!range) return null
      if (range.min != null && range.max != null)
        return range.min === range.max
          ? t("list.salaryExact", { value: range.min })
          : t("list.salary", { min: range.min, max: range.max })
      return range.max != null
        ? t("list.salaryUpTo", { max: range.max })
        : t("list.salaryFrom", { min: range.min })
    }

    const meta = (job: Job) => {
      const type = job.employment_type?.toLowerCase() ?? ""
      const mode = job.work_mode?.toLowerCase() ?? ""
      const openings = job.number_of_openings
      return [
        isOneOf(EMPLOYMENT_TYPES, type)
          ? t(`employment.${type as (typeof EMPLOYMENT_TYPES)[number]}`)
          : null,
        isOneOf(WORK_MODES, mode)
          ? t(`workMode.${mode as (typeof WORK_MODES)[number]}`)
          : null,
        openings && openings > 0
          ? t("list.openings", { count: openings })
          : null,
      ].filter((fact): fact is string => fact !== null)
    }

    return { years, salary, meta }
  }, [t])
}
