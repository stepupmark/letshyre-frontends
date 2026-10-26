import { useTranslation } from "@workspace/i18n/react"
import {
  BriefcaseIcon,
  CheckIcon,
  FileTextIcon,
  UserRoundIcon,
} from "lucide-react"

import { wait } from "@/components/art/delay"
import { Meter } from "@/components/art/meter"
import { ScoreRing } from "@/components/art/score-ring"

const LEVELS = [35, 70, 50, 90, 60, 80, 40, 75, 55, 85, 45, 65]
const OVERALL = 84
// one per label in how.preview.professionals.scorecard.skills
const SKILL_SCORES = [88, 82, 76]

interface Field {
  label: string
  value: string
}

interface Job {
  title: string
  company: string
  match: string
}

export function ProfilePreview() {
  const { t } = useTranslation("home")
  const fields = t("how.preview.professionals.profile.fields", {
    returnObjects: true,
  }) as Field[]

  return (
    <dl className="grid grid-cols-2 gap-3 rounded-xl border bg-background p-4">
      {fields.map((field, index) => (
        <div
          key={field.label}
          className={index === 0 ? "rise col-span-2" : "rise"}
          style={wait(index * 90)}
        >
          <dt className="text-xs text-muted-foreground">{field.label}</dt>
          <dd className="mt-1 rounded-md border px-2.5 py-1.5 text-sm font-medium">
            {field.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function ResumePreview() {
  const { t } = useTranslation("home")
  const roles = t("how.preview.professionals.resume.roles", {
    returnObjects: true,
  })

  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
        <FileTextIcon className="size-5 shrink-0 text-brand-text" />
        <span dir="ltr" className="min-w-0 flex-1 truncate text-sm font-medium">
          {t("how.preview.professionals.resume.file")}
        </span>
        <span
          className="pop inline-flex shrink-0 items-center gap-1 text-xs font-medium text-success"
          style={wait(250)}
        >
          <CheckIcon className="size-3.5" />
          {t("how.preview.professionals.resume.analysed")}
        </span>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        {t("how.preview.professionals.resume.suggested")}
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {roles.map((role, index) => (
          <li
            key={role}
            className="pop rounded-full border border-brand/30 bg-brand-muted px-2.5 py-0.5 text-xs font-medium text-brand-text"
            style={wait(400 + index * 120)}
          >
            {role}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function InterviewPreview() {
  const { t } = useTranslation("home")

  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <div className="flex items-center gap-2 border-b px-3 py-2 text-xs">
        <span className="font-semibold">
          {t("how.preview.professionals.interview.title")}
        </span>
        <span className="truncate text-muted-foreground">
          {t("how.preview.professionals.interview.role")}
        </span>
        <span className="ms-auto inline-flex items-center gap-1.5 text-muted-foreground tabular-nums">
          <span className="size-1.5 rounded-full bg-destructive" />
          {t("how.preview.professionals.interview.duration")}
        </span>
      </div>
      <div className="flex h-28 items-end gap-4 bg-muted/60 px-4 pt-4">
        <span className="flex size-14 shrink-0 items-end justify-center overflow-hidden rounded-t-full bg-brand-muted text-brand-text">
          <UserRoundIcon className="size-12 translate-y-1.5" />
        </span>
        <svg
          viewBox="0 0 120 50"
          preserveAspectRatio="none"
          className="mb-6 h-12 flex-1"
        >
          {LEVELS.map((level, index) => (
            <rect
              key={index}
              x={index * 10 + 1.5}
              y={50 - level / 2}
              width="7"
              height={level / 2}
              rx="1.5"
              className="level fill-brand"
              style={wait((index % 4) * 90)}
            />
          ))}
        </svg>
      </div>
      <p className="px-3 py-2 text-xs text-muted-foreground">
        {t("how.preview.professionals.interview.question")}
      </p>
    </div>
  )
}

export function ScorecardPreview() {
  const { t } = useTranslation("home")
  const skills = t("how.preview.professionals.scorecard.skills", {
    returnObjects: true,
  })

  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="font-semibold">
        {t("how.preview.professionals.scorecard.title")}
      </p>
      <div className="mt-3 flex items-center gap-5">
        <div className="flex flex-col items-center gap-1">
          <ScoreRing score={OVERALL} compact />
          <span className="text-xs text-muted-foreground">
            {t("how.preview.professionals.scorecard.overall")}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          {skills.map((skill, index) => (
            <Meter
              key={skill}
              label={skill}
              value={SKILL_SCORES[index] ?? 0}
              animate
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function MatchPreview() {
  const { t } = useTranslation("home")
  const jobs = t("how.preview.professionals.match.jobs", {
    returnObjects: true,
  }) as Job[]

  return (
    <ul className="flex flex-col gap-3">
      {jobs.map((job, index) => (
        <li
          key={job.title}
          className="rise flex items-center gap-3 rounded-xl border bg-background p-3"
          style={wait(index * 150)}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <BriefcaseIcon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {job.title}
            </span>
            <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              {job.company}
              <span className="font-medium text-brand-text">{job.match}</span>
            </span>
          </span>
          <span className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            {t("how.preview.professionals.match.apply")}
          </span>
        </li>
      ))}
    </ul>
  )
}
