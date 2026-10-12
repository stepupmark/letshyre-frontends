import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import {
  Banknote,
  Building2,
  BriefcaseBusiness,
  CalendarClock,
  Clock,
  GraduationCap,
  MapPin,
  Users,
} from "lucide-react"

import { dateLabel } from "../lib/format"
import {
  experienceText,
  salaryText,
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
  const deadline = dateLabel(values.deadline, locale)

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
      value: values.work_mode
        ? [
            t(`workMode.${values.work_mode as "remote"}`),
            values.employment_type
              ? t(`employment.${values.employment_type as "full_time"}`)
              : "",
          ]
            .filter(Boolean)
            .join(" · ")
        : "",
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
      value: deadline ?? "",
    },
  ].filter((fact) => fact.value)

  return (
    <article className="flex flex-col gap-8 text-sm">
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="font-medium wrap-anywhere">{value}</dd>
            </div>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-2">
        <h3 className="font-medium">{t("detail.about")}</h3>
        <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
          {values.overview.trim() || t("detail.none")}
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="font-medium">{t("detail.responsibilities")}</h3>
        {responsibilities.length ? (
          <ul className="flex list-disc flex-col gap-1.5 ps-5 leading-relaxed text-muted-foreground marker:text-foreground/40">
            {responsibilities.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">{t("detail.none")}</p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="font-medium">{t("detail.skills")}</h3>
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
      </section>
    </article>
  )
}
