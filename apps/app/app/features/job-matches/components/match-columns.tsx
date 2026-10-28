import { useTranslation } from "@workspace/i18n/react"
import { useMemo } from "react"

import type { DataTableColumn } from "@/lib/data-table-features"

import type { Match } from "../schemas/job-matches.schema"
import { MatchBreakdown } from "./match-breakdown"
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
          <div className="flex max-w-md min-w-72 flex-col gap-2">
            <MatchBreakdown match={row.original} />
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
    ],
    [t, open]
  )
}
