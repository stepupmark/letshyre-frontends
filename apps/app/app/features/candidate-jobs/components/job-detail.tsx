import { useLocale, useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import { useJobFacts } from "../hooks/use-job-facts"
import { type Job } from "../schemas/candidate-jobs.schema"
import { SkillList } from "./job-parts"

const deadlineOf = (raw: string | null | undefined, locale: string) => {
  const date = raw ? new Date(`${raw.slice(0, 10)}T00:00:00`) : null
  return date && Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date)
    : null
}

export function JobDetail({ job, query }: { job: Job; query?: string }) {
  const { t } = useTranslation("candidateJobs")
  const locale = useLocale()
  const facts = useJobFacts(job)
  const factsId = useId()
  const skills = job.skills_required ?? []
  const openings = job.number_of_openings
  const rows = [
    { key: "experience", value: facts.experience },
    { key: "salary", value: facts.salary },
    { key: "location", value: facts.location },
    { key: "type", value: facts.type },
    { key: "industry", value: job.industry_type },
    {
      key: "openings",
      value: openings ? new Intl.NumberFormat(locale).format(openings) : null,
    },
    {
      key: "deadline",
      value: deadlineOf(job.deadline, locale),
    },
  ] as const

  return (
    <div
      key={job.id}
      className="flex animate-in flex-col gap-6 duration-200 fade-in motion-reduce:animate-none"
    >
      <section aria-labelledby={factsId} className="flex flex-col gap-3">
        <h3 id={factsId} className="sr-only">
          {t("detail.facts")}
        </h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border p-3">
          {rows
            .filter((row) => row.value)
            .map((row) => (
              <div key={row.key} className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">
                  {t(`detail.${row.key}`)}
                </dt>
                <dd
                  className="font-medium wrap-break-word tabular-nums"
                  dir={row.key === "salary" ? "ltr" : undefined}
                >
                  {row.value}
                </dd>
              </div>
            ))}
        </dl>
      </section>
      {skills.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="font-medium">{t("detail.skills")}</h3>
          <SkillList skills={skills} query={query} />
        </section>
      )}
      <section className="flex flex-col gap-2">
        <h3 className="font-medium">{t("detail.about")}</h3>
        <p className="text-pretty whitespace-pre-line text-muted-foreground">
          {job.description?.trim()
            ? job.description
            : t("detail.noDescription")}
        </p>
      </section>
    </div>
  )
}
