import { useTranslation } from "@workspace/i18n/react"

import type { OwnProfile } from "../../schemas/candidate.schema"

export function CompletionRing({ profile }: { profile: OwnProfile }) {
  const { t } = useTranslation("candidate")
  const used = profile.interview_attempts_used
  const max = profile.max_interviews_allowed

  if (used == null || max == null || max <= 0) return null

  return (
    <div className="flex items-center gap-3 rounded-xl border p-3 pe-4">
      <p className="text-sm text-muted-foreground">
        <span className="tabular-nums">
          {t("list.attempts", { used: Math.min(used, max), max })}
        </span>{" "}
        {t("own.interviewsLeft", { count: Math.max(0, max - used) })}
      </p>
    </div>
  )
}
