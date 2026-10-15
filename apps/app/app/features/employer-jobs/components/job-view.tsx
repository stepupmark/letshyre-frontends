import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import {
  Banknote,
  Building2,
  BriefcaseBusiness,
  CalendarClock,
  Clock,
  FileText,
  GraduationCap,
  ListChecks,
  MapPin,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { useId, type ReactNode } from "react"

import { dateLabel } from "../lib/format"
import {
  EMPLOYMENT_TYPES,
  experienceText,
  salaryText,
  WORK_MODES,
  type Industry,
  type JobValues,
} from "../lib/job-values"

/** The job as candidates read it; the post preview and the detail page share it. */
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
      icon: BriefcaseBusiness,
      label: t("detail.facts.experience"),
      value:
        experienceText(values.experience_min, values.experience_max) ||
        t("notGiven"),
    },
    {
      icon: Banknote,
      label: t("detail.facts.salary"),
      value:
        salaryText(values.salary_min, values.salary_max) || t("notDisclosed"),
    },
    { icon: MapPin, label: t("detail.facts.place"), value: place },
    {
      icon: Clock,
      label: t("detail.facts.workMode"),
      value: [
        mode && t(`workMode.${mode}`),
        employment && t(`employment.${employment}`),
      ]
        .filter(Boolean)
        .join(" · "),
    },
    { icon: Building2, label: t("detail.facts.industry"), value: industry },
    {
      icon: GraduationCap,
      label: t("detail.facts.education"),
      value: values.education,
    },
    {
      icon: Users,
      label: t("detail.facts.openings"),
      value: Number(values.openings) > 0 ? values.openings : "",
    },
    {
      icon: CalendarClock,
      label: t("detail.facts.applyBy"),
      value: dateLabel(values.deadline, locale) ?? "",
    },
  ].filter((fact) => fact.value)

  return (
    <article className="flex flex-col gap-8 text-sm">
      <dl className="grid gap-3 sm:grid-cols-2">
        {facts.map(({ icon: Icon, label, value }, i) => (
          <div
            key={label}
            style={{ transitionDelay: `${i * 40}ms` }}
            className="settle relative flex min-h-15 flex-col justify-center gap-0.5 rounded-xl border p-3 ps-15"
          >
            <dt className="text-xs text-muted-foreground">
              <span
                aria-hidden="true"
                className="absolute inset-s-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg bg-brand-muted text-brand-text [&_svg]:size-4"
              >
                <Icon />
              </span>
              {label}
            </dt>
            <dd className="font-medium wrap-anywhere tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <Part title={t("detail.about")} icon={FileText}>
        <p className="text-pretty whitespace-pre-line text-muted-foreground">
          {values.overview.trim() || t("detail.none")}
        </p>
      </Part>

      <Part title={t("detail.responsibilities")} icon={ListChecks}>
        {responsibilities.length ? (
          <ul className="flex list-disc flex-col gap-2 ps-5 text-muted-foreground marker:text-brand">
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

      <Part title={t("detail.skills")} icon={Wrench}>
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

function Part({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: LucideIcon
  children: ReactNode
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2
        id={id}
        className="flex items-center gap-2 text-base font-semibold text-brand-text"
      >
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        {title}
      </h2>
      {children}
    </section>
  )
}
