import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import * as m from "motion/react-m"
import { useId, type ReactNode } from "react"

import { duration, ease } from "@/lib/motion"

import { dateLabel } from "../lib/format"
import {
  EMPLOYMENT_TYPES,
  experienceText,
  salaryText,
  WORK_MODES,
  type Industry,
  type JobValues,
} from "../lib/job-values"

// the job as candidates read it; the post preview and the detail page share it
export function JobView({
  values,
  industries,
}: {
  values: JobValues
  industries: Industry[]
}) {
  const { t } = useTranslation("jobs")
  const locale = useLocale()
  const industry =
    industries.find((i) => i.value === values.industry)?.label ??
    values.industry
  const place = [values.location, values.city, values.state, values.country]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ")
  const responsibilities = values.responsibilities
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  const mode = WORK_MODES.find((m) => m === values.work_mode)
  const employment = EMPLOYMENT_TYPES.find((e) => e === values.employment_type)

  const facts = [
    {
      label: t("detail.facts.experience"),
      value:
        experienceText(values.experience_min, values.experience_max) ||
        t("notGiven"),
    },
    {
      label: t("detail.facts.salary"),
      value:
        salaryText(values.salary_min, values.salary_max) || t("notDisclosed"),
    },
    { label: t("detail.facts.place"), value: place },
    {
      label: t("detail.facts.workMode"),
      value: [
        mode && t(`workMode.${mode}`),
        employment && t(`employment.${employment}`),
      ]
        .filter(Boolean)
        .join(" · "),
    },
    { label: t("detail.facts.industry"), value: industry },
    {
      label: t("detail.facts.education"),
      value: values.education,
    },
    {
      label: t("detail.facts.openings"),
      value: Number(values.openings) > 0 ? values.openings : "",
    },
    {
      label: t("detail.facts.applyBy"),
      value: dateLabel(values.deadline, locale) ?? "",
    },
  ].filter((fact) => fact.value)

  return (
    <article className="flex flex-col gap-8 text-sm">
      <dl className="grid gap-x-8 border-t sm:grid-cols-2">
        {facts.map(({ label, value }, i) => (
          <m.div
            key={label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: duration.base,
              ease,
              delay: Math.min(i, 7) * 0.03,
            }}
            className="flex flex-col gap-0.5 border-b py-3"
          >
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-medium wrap-anywhere tabular-nums">{value}</dd>
          </m.div>
        ))}
      </dl>

      <Part title={t("detail.about")}>
        <p className="max-w-prose text-pretty whitespace-pre-line">
          {values.overview.trim() || t("detail.none")}
        </p>
      </Part>

      <Part title={t("detail.responsibilities")}>
        {responsibilities.length ? (
          <ul className="flex max-w-prose list-disc flex-col gap-2 ps-5 marker:text-muted-foreground">
            {responsibilities.map((line, i) => (
              <li key={i} className="text-pretty">
                {line}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">{t("detail.none")}</p>
        )}
      </Part>

      <Part title={t("detail.skills")}>
        {values.skills.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {values.skills.map((skill) => (
              <li key={skill}>
                <Badge variant="secondary">{skill}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">{t("detail.none")}</p>
        )}
      </Part>
    </article>
  )
}

function Part({ title, children }: { title: string; children: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-base font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  )
}
