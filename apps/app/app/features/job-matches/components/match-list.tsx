import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import { useSearchParams } from "react-router"

import { DataTable } from "@/components/data-table"
import { DetailSheet } from "@/components/detail-sheet"
import { ScoreBand } from "@/components/score-band"
import { useDetailParam } from "@/hooks/use-detail-param"
import { bandOf } from "@/lib/score-band"

import { BANDS, matchScore, type BandFilter } from "../lib/job-matches"
import { matchesQuery } from "../queries/job-matches.queries"
import type { Match } from "../schemas/job-matches.schema"
import { BandTabs } from "./band-tabs"
import { useMatchColumns } from "./match-columns"
import { MatchPeek } from "./match-peek"
import { MatchPerson } from "./match-person"

const BAND_PARAM = "band"

const rowId = (match: Match) => match.candidate_id
const rowLabel = (match: Match) => match.candidate_name ?? match.candidate_id

// AI-matched candidates for one job, reviewed with j/k in a side panel
export function MatchList({
  jobId,
  appliedOnly,
  empty,
  actions,
}: {
  jobId: string
  appliedOnly: boolean
  empty: ReactNode
  actions?: (match: Match) => ReactNode
}) {
  const { t } = useTranslation("matches")
  const [search, setSearch] = useSearchParams()
  const [openId, setOpenId] = useDetailParam("candidate")
  const query = useQuery(matchesQuery(jobId, appliedOnly))
  const columns = useMatchColumns(setOpenId)
  const all = query.data?.matches
  const raw = search.get(BAND_PARAM)
  const band: BandFilter = BANDS.find((x) => x === raw) ?? "all"

  const counts = useMemo(() => {
    const result: Record<BandFilter, number> = {
      all: 0,
      strong: 0,
      partial: 0,
      low: 0,
    }
    for (const match of all ?? []) {
      result.all += 1
      result[bandOf(matchScore(match))] += 1
    }
    return result
  }, [all])

  const rows = useMemo(
    () =>
      all?.filter(
        (match) => band === "all" || bandOf(matchScore(match)) === band
      ),
    [all, band]
  )

  const setBand = (value: BandFilter) => {
    setSearch(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (value === "all") params.delete(BAND_PARAM)
        else params.set(BAND_PARAM, value)
        return params
      },
      { replace: true, preventScrollReset: true }
    )
  }

  const index = rows?.findIndex((m) => m.candidate_id === openId) ?? -1
  const open = index >= 0 ? rows?.[index] : undefined
  // keeps the panel filled while it animates closed
  const [last, setLast] = useState(open)
  if (open && open !== last) setLast(open)
  const shown = open ?? last
  const previous = index > 0 ? rows?.[index - 1] : undefined
  const next = index >= 0 ? rows?.[index + 1] : undefined

  return (
    <div className="flex flex-col gap-4">
      {Boolean(all?.length) && (
        <BandTabs value={band} counts={counts} onChange={setBand} />
      )}

      <DataTable
        columns={columns}
        data={rows}
        total={rows?.length ?? 0}
        pageCount={1}
        getRowId={rowId}
        rowLabel={rowLabel}
        pending={query.isFetching}
        error={query.isError}
        onRetry={() => void query.refetch()}
        loadError={{ title: t("errorTitle"), body: t("errorBody") }}
        empty={empty}
        filtered={band !== "all"}
        onClearFilters={() => {
          setBand("all")
        }}
        keyboard
        mobileRow={(match) => (
          <button
            type="button"
            onClick={() => {
              setOpenId(match.candidate_id)
            }}
            className="group flex w-full flex-col gap-2 rounded-lg border bg-card p-4 text-start transition-colors active:bg-muted"
          >
            <span className="flex w-full items-start justify-between gap-3">
              <span className="flex min-w-0 items-center gap-3">
                <MatchPerson match={match} />
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <ScoreBand score={matchScore(match)} />
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 text-muted-foreground rtl:-scale-x-100"
                />
              </span>
            </span>
            {match.ai_match?.rationale && (
              <span className="line-clamp-2 text-xs text-pretty text-muted-foreground">
                {match.ai_match.rationale}
              </span>
            )}
          </button>
        )}
      />

      <DetailSheet
        open={Boolean(open)}
        onClose={() => {
          setOpenId(null)
        }}
        title={shown ? (shown.candidate_name ?? t("unnamed")) : ""}
        description={shown?.ai_match?.role_applied}
        position={
          rows && index >= 0
            ? { current: index + 1, total: rows.length }
            : undefined
        }
        onPrevious={
          previous
            ? () => {
                setOpenId(previous.candidate_id)
              }
            : undefined
        }
        onNext={
          next
            ? () => {
                setOpenId(next.candidate_id)
              }
            : undefined
        }
      >
        {shown && <MatchPeek match={shown} actions={actions} />}
      </DetailSheet>
    </div>
  )
}
