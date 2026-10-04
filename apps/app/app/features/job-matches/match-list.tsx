import { useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState, type ReactNode } from "react"
import { useSearchParams } from "react-router"

import { DataTable } from "@/components/data-table"
import { DetailSheet } from "@/components/detail-sheet"
import { ScoreBand } from "@/components/score-band"
import { useDetailParam } from "@/hooks/use-detail-param"
import type { DataTableColumn } from "@/lib/data-table-features"
import { safeUrl } from "@/lib/safe-url"
import { bandOf } from "@/lib/score-band"

import { matchesQuery, matchScore, type Match } from "./api"

const BANDS = ["all", "strong", "partial", "low"] as const
const BAND_PARAM = "band"
type Filter = (typeof BANDS)[number]

const rowId = (match: Match) => match.candidate_id
const rowLabel = (match: Match) => match.candidate_name ?? match.candidate_id
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

/**
 * AI-matched candidates for one job as bands with reasons, reviewed with
 * j/k in a side panel. `actions` adds to the panel, e.g. unlocking.
 */
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
  const all = query.data?.matches
  const raw = search.get(BAND_PARAM)
  const band: Filter = BANDS.find((x) => x === raw) ?? "all"

  const counts = useMemo(() => {
    const result: Record<Filter, number> = {
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

  const setBand = (value: string | null) => {
    setSearch(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (value) params.set(BAND_PARAM, value)
        else params.delete(BAND_PARAM)
        return params
      },
      { replace: true, preventScrollReset: true }
    )
  }

  const name = (match: Match) => match.candidate_name ?? t("unnamed")

  const columns = useMemo<DataTableColumn<Match>[]>(
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
              setOpenId(row.original.candidate_id)
            }}
            className="flex w-full max-w-64 items-center gap-3 rounded-sm text-start outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Person match={row.original} />
          </button>
        ),
      },
      {
        id: "match",
        header: t("columns.match"),
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex max-w-md flex-col items-start gap-1">
            <ScoreBand score={matchScore(row.original)} />
            {row.original.ai_match?.rationale && (
              <p className="line-clamp-2 text-xs whitespace-normal text-muted-foreground">
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
          return (
            <span className="tabular-nums">
              {years == null ? "—" : t("years", { count: Math.round(years) })}
            </span>
          )
        },
      },
      {
        id: "interviews",
        header: t("columns.interviews"),
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.interview_attempts?.length ?? 0}
          </span>
        ),
      },
    ],
    [t, setOpenId]
  )

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
        <Tabs
          value={band}
          onValueChange={(value) => {
            setBand(value === "all" ? null : String(value))
          }}
        >
          <TabsList>
            {BANDS.map((x) => (
              <TabsTrigger key={x} value={x}>
                {t(`bands.${x}`)}
                <span className="text-muted-foreground tabular-nums">
                  {counts[x]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <DataTable
        columns={columns}
        data={rows}
        total={rows?.length ?? 0}
        pageCount={1}
        getRowId={rowId}
        rowLabel={rowLabel}
        params={{ page: 1, sort: null, q: "" }}
        onParams={() => undefined}
        pending={query.isFetching}
        error={query.isError}
        onRetry={() => void query.refetch()}
        empty={empty}
        filtered={band !== "all"}
        onClearFilters={() => {
          setBand(null)
        }}
        onOpen={(match) => {
          setOpenId(match.candidate_id)
        }}
        mobileRow={(match) => (
          <button
            type="button"
            onClick={() => {
              setOpenId(match.candidate_id)
            }}
            className="flex w-full flex-col gap-2 rounded-lg border p-4 text-start transition-colors active:bg-muted"
          >
            <span className="flex items-start justify-between gap-3">
              <span className="flex min-w-0 items-center gap-3">
                <Person match={match} />
              </span>
              <ScoreBand score={matchScore(match)} />
            </span>
            {match.ai_match?.rationale && (
              <span className="line-clamp-2 text-xs text-muted-foreground">
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
        title={shown ? name(shown) : ""}
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
        {shown && <Peek match={shown} actions={actions} />}
      </DetailSheet>
    </div>
  )
}

function Person({ match }: { match: Match }) {
  const { t } = useTranslation("matches")
  const name = match.candidate_name ?? t("unnamed")
  const photo = safeUrl(match.profile_photo_url)
  return (
    <>
      <Avatar>
        {photo && <AvatarImage src={photo} alt="" />}
        <AvatarFallback className="text-xs text-foreground">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0">
        <span className="block truncate font-medium">{name}</span>
        {match.ai_match?.role_applied && (
          <span className="block truncate text-xs text-muted-foreground">
            {match.ai_match.role_applied}
          </span>
        )}
      </span>
    </>
  )
}

function Peek({
  match,
  actions,
}: {
  match: Match
  actions?: (match: Match) => ReactNode
}) {
  const { t } = useTranslation("matches")
  const ai = match.ai_match
  const years = ai?.years_experience
  const fit = (score: number | null | undefined, label: string) =>
    score == null ? null : (
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">{label}</span>
        <ScoreBand score={score} />
      </div>
    )

  return (
    <div
      key={match.candidate_id}
      className="flex animate-in flex-col gap-6 duration-200 fade-in motion-reduce:animate-none"
    >
      <div className="flex flex-wrap items-center gap-2">
        <ScoreBand score={matchScore(match)} />
        {years != null && (
          <span className="text-muted-foreground tabular-nums">
            {t("peek.experience", { count: Math.round(years) })}
          </span>
        )}
      </div>

      <section className="flex flex-col gap-1">
        <h3 className="font-medium">{t("peek.why")}</h3>
        <p className="text-muted-foreground">
          {ai?.rationale ?? t("peek.noReason")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("peek.whyNote")}
        </p>
      </section>

      {actions ? (
        actions(match)
      ) : (
        <section className="flex flex-col gap-2">
          <h3 className="font-medium">{t("peek.interviews")}</h3>
          {match.interview_attempts?.length ? (
            <ul className="flex flex-col divide-y rounded-lg border">
              {match.interview_attempts.map((attempt, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <span className="min-w-0 truncate">{attempt.role}</span>
                  {attempt.overall_score != null && (
                    <ScoreBand score={attempt.overall_score} of="interview" />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{t("peek.noInterviews")}</p>
          )}
        </section>
      )}

      {(ai?.role_match_score != null || ai?.skills_match_score != null) && (
        <section className="flex flex-col gap-2">
          {fit(ai.role_match_score, t("peek.role"))}
          {fit(ai.skills_match_score, t("peek.skills"))}
        </section>
      )}

      {Boolean(ai?.matched_skills?.length) ||
      Boolean(ai?.missing_skills?.length) ? (
        <section className="grid grid-cols-2 gap-4">
          <Skills title={t("peek.has")} skills={ai?.matched_skills} />
          <Skills
            title={t("peek.missing")}
            skills={ai?.missing_skills}
            none={t("peek.noneMissing")}
          />
        </section>
      ) : null}
    </div>
  )
}

function Skills({
  title,
  skills,
  none,
}: {
  title: string
  skills: string[] | null | undefined
  none?: string
}) {
  return (
    <div>
      <h3 className="mb-2 font-medium">{title}</h3>
      {skills?.length ? (
        <ul className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <li key={skill}>
              <Badge variant="secondary">{skill}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">{none ?? "—"}</p>
      )}
    </div>
  )
}
