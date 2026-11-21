import { useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Plus, Sparkles, X } from "lucide-react"
import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"

import { type Review } from "../../schemas/candidate-onboarding.schema"
import { type ResumeState } from "../../lib/resume-state"
import { RolePicker } from "./role-picker"

export function Found({
  value,
  error,
  onChange,
  onReplace,
}: {
  value: ResumeState
  error?: string
  onChange: (next: ResumeState) => void
  onReplace: () => void
}) {
  const { t } = useTranslation("candidateOnboarding")
  const review = value.review ?? {
    skills: [],
    certifications: [],
    education: [],
    experience: [],
    projects: [],
  }
  const setReview = (next: Partial<Review>) => {
    onChange({ ...value, review: { ...review, ...next } })
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease }}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 px-4 py-3 text-sm">
        <span className="flex min-w-0 items-center gap-2">
          <Sparkles className="size-4 shrink-0" aria-hidden="true" />
          <span>
            {t("resume.found", {
              name: value.fileName || t("resume.yourResume"),
            })}
          </span>
        </span>
        <Button variant="ghost" size="sm" onClick={onReplace}>
          {t("resume.replace")}
        </Button>
      </div>

      <RolePicker value={value} error={error} onChange={onChange} />

      <Skills skills={review.skills} />

      <Entries
        title={t("resume.experience")}
        empty={t("resume.noExperience")}
        items={review.experience}
        fields={[
          ["role", t("resume.fields.role")],
          ["company", t("resume.fields.company")],
          ["duration", t("resume.fields.duration")],
        ]}
        blank={{ role: "", company: "", duration: "", description: "" }}
        onChange={(experience) => {
          setReview({ experience })
        }}
      />

      <Entries<{ institution: string; degree: string; duration: string }>
        title={t("resume.education")}
        empty={t("resume.noEducation")}
        items={review.education}
        fields={[
          ["institution", t("resume.fields.institution")],
          ["degree", t("resume.fields.degree")],
          ["duration", t("resume.fields.duration")],
        ]}
        onChange={(education) => {
          setReview({ education })
        }}
      />
    </m.div>
  )
}

function Skills({ skills }: { skills: string[] }) {
  const { t } = useTranslation("candidateOnboarding")
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-medium">{t("resume.skills")}</h3>
      <ul className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <li key={skill}>
            <Badge variant="outline">{skill}</Badge>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Entries<T extends Record<string, string>>({
  title,
  empty,
  items,
  fields,
  blank,
  onChange,
}: {
  title: string
  empty: string
  items: T[]
  fields: [keyof T & string, string][]
  /** a new, empty row; without it the list can't grow */
  blank?: T
  onChange: (items: T[]) => void
}) {
  const { t } = useTranslation("candidateOnboarding")
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-medium">{title}</h3>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
      <ul className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_10rem_auto]"
          >
            {fields.map(([key, label]) => (
              <Input
                key={key}
                aria-label={`${label} ${i + 1}`}
                placeholder={label}
                value={item[key]}
                onChange={(event) => {
                  onChange(
                    items.map((row, j) =>
                      j === i ? { ...row, [key]: event.target.value } : row
                    )
                  )
                }}
              />
            ))}
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("resume.removeEntry", { number: i + 1 })}
              className="justify-self-end"
              onClick={() => {
                onChange(items.filter((_, j) => j !== i))
              }}
            >
              <X />
            </Button>
          </li>
        ))}
      </ul>
      {blank && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => {
            onChange([...items, blank])
          }}
        >
          <Plus />
          {t("resume.addEntry")}
        </Button>
      )}
    </section>
  )
}
