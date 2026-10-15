import { useTranslation } from "@workspace/i18n/react"
import type { CSSProperties } from "react"

import type { OwnProfile } from "../../schemas/candidate.schema"

const RADIUS = 22

export function CompletionRing({ profile }: { profile: OwnProfile }) {
  const { t } = useTranslation("candidate")
  const score = Math.min(
    100,
    Math.max(0, profile.profile_completion_score ?? 0)
  )
  const arc = score / 100
  const used = profile.interview_attempts_used
  const max = profile.max_interviews_allowed

  return (
    <div className="flex items-center gap-3 rounded-xl border p-3 pe-4">
      <svg viewBox="0 0 56 56" className="size-14 shrink-0" aria-hidden="true">
        <circle
          cx={28}
          cy={28}
          r={RADIUS}
          strokeWidth={5}
          className="fill-none stroke-muted"
        />
        <circle
          cx={28}
          cy={28}
          r={RADIUS}
          strokeWidth={5}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${arc} 1`}
          transform="rotate(-90 28 28)"
          className="ring-fill fill-none stroke-brand"
          style={{ "--ring": arc } as CSSProperties}
        />
        <text
          x={28}
          y={28}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground text-xs font-semibold tabular-nums"
        >
          {`${score}%`}
        </text>
      </svg>
      <div className="flex flex-col gap-0.5 text-sm">
        <p className="font-semibold">
          {score === 100
            ? t("own.completion")
            : t("own.completionScore", { score })}
        </p>
        {used != null && max != null && max > 0 && (
          <p className="text-muted-foreground">
            <span className="tabular-nums">
              {t("own.interviewsUsed", { used, max })}
            </span>{" "}
            {t("own.interviewsLeft", { count: Math.max(0, max - used) })}
          </p>
        )}
      </div>
    </div>
  )
}
