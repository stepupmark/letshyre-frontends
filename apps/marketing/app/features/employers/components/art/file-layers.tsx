import { useTranslation } from "@workspace/i18n/react"
import {
  CodeIcon,
  ListChecksIcon,
  LockOpenIcon,
  AudioLinesIcon,
  PenLineIcon,
  SparklesIcon,
} from "lucide-react"

import { Avatar } from "@/components/art/avatar"
import { Fact } from "@/components/art/file-head"
import { Meter } from "@/components/art/meter"
import { ScoreRing } from "@/components/art/score-ring"

const TYPE_ICONS = [ListChecksIcon, CodeIcon, PenLineIcon, AudioLinesIcon]

export function ProfileLayer() {
  const { t } = useTranslation("employers")
  return (
    <div className="flex flex-col gap-3">
      <Fact
        label={t("build.layers.experience")}
        value={t("build.layers.experienceValue")}
      />
      <Fact
        label={t("build.layers.notice")}
        value={t("build.layers.noticeValue")}
      />
      <Meter label={t("build.layers.jobMatch")} value={92} text="92%" />
      <Meter label={t("build.layers.skillMatch")} value={88} text="88%" />
    </div>
  )
}

export function InterviewLayer() {
  const { t } = useTranslation("employers")
  const types = t("build.layers.types", { returnObjects: true })
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">
        {t("build.layers.interview")}
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {types.map((type, i) => {
          const Icon = TYPE_ICONS[i] ?? ListChecksIcon
          return (
            <li
              key={type}
              className="flex items-center gap-2 rounded-lg border bg-card px-2.5 py-2 text-sm"
            >
              <Icon className="size-4 shrink-0 text-brand-text" />
              <span className="truncate">{type}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function ScoreLayer() {
  const { t } = useTranslation("employers")
  return (
    <div className="flex items-center gap-4">
      <ScoreRing score={84} compact />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <Meter label={t("build.layers.clarity")} value={82} />
        <Meter label={t("build.layers.depth")} value={79} />
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SparklesIcon className="size-3.5 text-brand-text" />
          {t("build.layers.strength")}:{" "}
          <span className="font-medium text-foreground">
            {t("build.layers.strengthValue")}
          </span>
        </p>
      </div>
    </div>
  )
}

export function UnlockLayer({ people }: { people: string[] }) {
  const { t } = useTranslation("employers")
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="flex min-w-0 items-center gap-2.5 text-sm">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <LockOpenIcon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold">
            {t("build.layers.unlocked")}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {t("build.layers.contents")}
          </span>
        </span>
      </p>
      <span className="flex items-center gap-2 rounded-full border bg-card py-1 ps-1 pe-3 text-xs font-medium">
        <span className="flex -space-x-2">
          {people.map((name) => (
            <Avatar
              key={name}
              name={name}
              className="size-6 text-[0.625rem] ring-2 ring-card"
            />
          ))}
        </span>
        {t("build.layers.compare")}
      </span>
    </div>
  )
}
