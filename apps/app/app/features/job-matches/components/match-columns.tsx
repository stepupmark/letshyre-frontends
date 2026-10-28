import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { LockOpen } from "lucide-react"
import { useMemo } from "react"

import { StatusBadge } from "@/components/status-badge"
import type { DataTableColumn } from "@/lib/data-table-features"

import { isUnlocked } from "../lib/job-matches"
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
            className="group flex w-full max-w-72 min-w-56 items-center gap-4 rounded-sm text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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
      {
        id: "unlock",
        header: () => <span className="sr-only">{t("columns.unlock")}</span>,
        enableHiding: false,
        cell: ({ row }) =>
          isUnlocked(row.original) ? (
            <StatusBadge tone="success">{t("unlocked")}</StatusBadge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              aria-label={t("unlockFor", {
                name: row.original.candidate_name ?? t("unnamed"),
              })}
              onClick={() => {
                open(row.original.candidate_id)
              }}
            >
              <LockOpen aria-hidden="true" />
              {t("columns.unlock")}
            </Button>
          ),
      },
    ],
    [t, open]
  )
}
