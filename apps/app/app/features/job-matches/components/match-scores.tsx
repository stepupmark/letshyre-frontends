import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"
import { bandOf } from "@/lib/score-band"

import { bestInterview, matchScore } from "../lib/job-matches"
import type { Match } from "../schemas/job-matches.schema"

export function MatchScores({
  match,
  className,
}: {
  match: Match
  className?: string
}) {
  const { t } = useTranslation("matches")
  const ai = match.ai_match
  const scores = [
    { key: "ai", label: t("scores.ai"), value: matchScore(match) },
    { key: "role", label: t("scores.role"), value: ai?.role_match_score },
    { key: "skills", label: t("scores.skills"), value: ai?.skills_match_score },
    {
      key: "interview",
      label: t("scores.interview"),
      value: bestInterview(match),
    },
  ]

  return (
    <dl className={cn("flex flex-wrap gap-3", className)}>
      {scores.map((score, i) => (
        <Ring
          key={score.key}
          label={score.label}
          value={score.value}
          delay={i * 0.06}
        />
      ))}
    </dl>
  )
}

function Ring({
  label,
  value,
  delay,
}: {
  label: string
  value: number | null | undefined
  delay: number
}) {
  const known = value != null
  const n = known ? Math.min(100, Math.max(0, Math.round(value))) : 0
  return (
    <div className="flex w-14 flex-col-reverse items-center gap-1">
      <dt className="text-center text-xs text-muted-foreground">{label}</dt>
      <dd className="relative grid size-11 place-items-center">
        <svg
          viewBox="0 0 36 36"
          aria-hidden="true"
          className="absolute inset-0 -rotate-90 rtl:scale-x-[-1]"
        >
          <circle
            cx="18"
            cy="18"
            r="15"

            strokeWidth="3"
            className="fill-none stroke-muted"
          />
          {known && (
            <m.circle
              cx="18"
              cy="18"
              r="15"

              strokeWidth="3"
              strokeLinecap="round"
              data-band={bandOf(n)}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: n / 100 }}
              transition={{ duration: duration.slow, ease, delay }}
              className="fill-none stroke-destructive/70 data-[band=partial]:stroke-warning data-[band=strong]:stroke-success"
            />
          )}
        </svg>
        <span className="text-xs font-semibold tabular-nums">
          {known ? n : "—"}
        </span>
      </dd>
    </div>
  )
}
