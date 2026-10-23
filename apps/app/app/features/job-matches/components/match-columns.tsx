import { useTranslation } from "@workspace/i18n/react"
import { useMemo } from "react"

import { ScoreBand } from "@/components/score-band"
import type { DataTableColumn } from "@/lib/data-table-features"

import { bestInterview, matchScore } from "../lib/job-matches"
import type { Match } from "../schemas/job-matches.schema"
import { MatchMeter } from "./match-meter"
import { MatchPerson } from "./match-person"

export function useMatchColumns(open: (id: string) => void) {
  const { t } = useTranslation("matches")
  return useMemo<DataTableColumn<Match>[]>(
    () => [
      {
        id: "candidate",
        header: t("columns.candidate"),
        enableHiding: false,
        cell: ({ row }) => (
          <button
            type="button"
            data-row-open=""
            onClick={() => {
              open(row.original.candidate_id)
            }}
            className="group flex w-full max-w-64 items-center gap-3 rounded-sm text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <MatchPerson match={row.original} />
          </button>
        ),
      },
      {
        id: "match",
        header: t("columns.match"),
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex max-w-md flex-col items-start gap-1.5">
            <span className="flex items-center gap-2.5">
              <ScoreBand score={matchScore(row.original)} />
              <MatchMeter score={matchScore(row.original)} className="w-16" />
            </span>
            {row.original.ai_match?.rationale && (
              <p className="line-clamp-2 text-xs text-pretty whitespace-normal text-muted-foreground">
                {row.original.ai_match.rationale}
              </p>
            )}
          </div>
        ),
      },
      {
        id: "experience",
        header: t("columns.experience"),
        cell: ({ row }) => {
          const years = row.original.ai_match?.years_experience
          return years == null ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <span className="whitespace-nowrap tabular-nums">
              {t("years", { count: Math.round(years) })}
            </span>
          )
        },
      },
      {
        id: "interviews",
        header: t("columns.interviews"),
        cell: ({ row }) => {
          const taken = row.original.interview_attempts?.length ?? 0
          const best = bestInterview(row.original)
          if (taken === 0)
            return <span className="text-muted-foreground">—</span>
          return (
            <span className="flex flex-col items-start gap-1">
              <span className="text-xs text-muted-foreground tabular-nums">
                {t("interviewsTaken", { count: taken })}
              </span>
              {best != null && <ScoreBand score={best} of="interview" />}
            </span>
          )
        },
      },
    ],
    [t, open]
  )
}
