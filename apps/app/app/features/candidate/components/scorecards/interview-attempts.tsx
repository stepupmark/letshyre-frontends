import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"

import { ownProfileQuery } from "../../queries/candidate.queries"

const MAX_DOTS = 10

export function InterviewAttempts() {
  const { t } = useTranslation("candidate")
  const { data } = useQuery(ownProfileQuery())
  const used = data?.interview_attempts_used
  const max = data?.max_interviews_allowed
  if (used == null || max == null || max <= 0) return null
  const left = Math.max(0, max - used)

  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
      {max <= MAX_DOTS && (
        <span aria-hidden="true" className="flex gap-1">
          {Array.from({ length: max }, (_, i) => (
            <span
              key={i}
              data-used={i < used}
              className="size-2 rounded-full border border-foreground/30 data-[used=true]:border-transparent data-[used=true]:bg-brand"
            />
          ))}
        </span>
      )}
      <p className="tabular-nums">
        {t("list.attempts", { used: Math.min(used, max), max })}{" "}
        {t("own.interviewsLeft", { count: left })}
      </p>
    </div>
  )
}
