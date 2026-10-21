import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon, EyeIcon, FileTextIcon } from "lucide-react"

import { Fact } from "@/components/art/file-head"
import { ScoreRing } from "@/components/art/score-ring"

export function ProfileLayer() {
  const { t } = useTranslation("candidates")
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
    </div>
  )
}

export function ResumeLayer() {
  const { t } = useTranslation("candidates")
  const roles = t("build.layers.roleItems", { returnObjects: true })
  return (
    <div>
      <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <FileTextIcon className="size-3.5 text-brand-text" />
        {t("build.layers.roles")}
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {roles.map((role, i) => (
          <li
            key={role}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              i === 0 && "border-brand/30 bg-brand-muted text-brand-text"
            )}
          >
            {role}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function InterviewsLayer() {
  const { t } = useTranslation("candidates")
  const attempts = t("build.layers.attempts", {
    returnObjects: true,
  })
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">
        {t("build.layers.interviews")}
      </p>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {attempts.map((attempt, i) => (
          <li
            key={attempt}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg p-2 text-xs",
              i === 0
                ? "bg-primary font-medium text-primary-foreground"
                : "border border-dashed text-muted-foreground"
            )}
          >
            {i === 0 && <CheckIcon className="size-3.5 shrink-0" />}
            <span className="truncate">{attempt}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ScorecardLayer() {
  const { t } = useTranslation("candidates")
  return (
    <div className="flex items-center gap-4">
      <ScoreRing score={82} compact />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{t("build.layers.score")}</p>
        <p className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <EyeIcon className="size-3.5 text-brand-text" />
            {t("build.layers.visible")}
          </span>
          <span className="font-medium text-foreground tabular-nums">
            {t("build.layers.days")}
          </span>
        </p>
        <span className="mt-2 block h-1.5 rounded-full bg-brand" />
      </div>
    </div>
  )
}
