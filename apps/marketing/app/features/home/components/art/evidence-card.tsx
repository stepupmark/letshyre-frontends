import type { CSSProperties } from "react"

import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon } from "lucide-react"

import { FileHead } from "@/components/art/file-head"
import { Meter } from "@/components/art/meter"
import { ScoreRing } from "@/components/art/score-ring"

const SCORES = [
  { key: "jobMatch", value: 92, text: "92%" },
  { key: "skillMatch", value: 88, text: "88%" },
  { key: "interview", value: 84, text: "84/100" },
] as const

/** What comes out of the interview: a scored file an employer can trust. */
export function EvidenceCard({
  className,
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  const { t } = useTranslation("home")
  const skills = t("hero.file.skills", { returnObjects: true })

  return (
    <div
      className={cn(
        "rounded-2xl border border-brand/30 bg-card p-4 sm:p-5",
        className
      )}
      style={style}
    >
      <div className="flex items-center gap-3">
        <FileHead name={t("hero.file.name")} role={t("hero.file.role")} />
        <span className="ms-auto inline-flex shrink-0 items-center gap-1 rounded-full border border-success/30 bg-success-muted px-2 py-0.5 text-xs font-medium whitespace-nowrap text-success">
          <CheckIcon className="size-3" />
          {t("hero.file.verified")}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <ScoreRing
          score={86}
          caption={t("hero.file.outOf")}
          compact
          className="[&_.ink]:[animation-delay:1600ms]"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {SCORES.map((score) => (
            <Meter
              key={score.key}
              label={t(`hero.file.${score.key}`)}
              value={score.value}
              text={score.text}
              animate
              className="[&_.bar-in]:[animation-delay:1600ms]"
            />
          ))}
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <li
            key={skill}
            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
          >
            <CheckIcon className="size-3 text-brand-text" />
            {skill}
          </li>
        ))}
      </ul>
    </div>
  )
}
