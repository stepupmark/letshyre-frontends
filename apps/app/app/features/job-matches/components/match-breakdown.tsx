import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"

import { bestInterview, matchScore } from "../lib/job-matches"
import type { Match } from "../schemas/job-matches.schema"

export function MatchBreakdown({
  match,
  className,
}: {
  match: Match
  className?: string
}) {
  const { t } = useTranslation("matches")
  const ai = match.ai_match
  const parts = [
    { key: "role", label: t("scores.role"), value: ai?.role_match_score },
    { key: "skills", label: t("scores.skills"), value: ai?.skills_match_score },
    {
      key: "interview",
      label: t("scores.interview"),
      value: bestInterview(match),
    },
  ]

  return (
    <div className={cn("flex w-full items-center gap-5", className)}>
      <p className="flex shrink-0 flex-col-reverse">
        <span className="text-xs text-muted-foreground">{t("scores.ai")}</span>
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          {matchScore(match)}
        </span>
      </p>
      <dl className="flex min-w-36 flex-1 flex-col gap-1.5 text-xs">
        {parts.map((part, i) => (
          <Part
            key={part.key}
            label={part.label}
            value={part.value}
            delay={i * 0.06}
          />
        ))}
      </dl>
    </div>
  )
}

function Part({
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
    <div className="flex items-center gap-2">
      <dt className="w-16 shrink-0 truncate text-muted-foreground">{label}</dt>
      <span
        aria-hidden="true"
        className="block h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
      >
        <span className="block h-full" style={{ width: `${n}%` }}>
          <m.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: duration.slow, ease, delay }}
            className="block h-full origin-left rounded-full bg-foreground/70 rtl:origin-right"
          />
        </span>
      </span>
      <dd className="w-6 shrink-0 text-end font-medium tabular-nums">
        {known ? n : "—"}
      </dd>
    </div>
  )
}
