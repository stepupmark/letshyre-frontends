import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { BadgeCheck } from "lucide-react"
import { useMemo, type ReactNode } from "react"
import { href, useSearchParams } from "react-router"

import { AppLink } from "@/components/app-link"
import { DataTable } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { GuideLink } from "@/components/guide-link"
import { ScoreBand } from "@/components/score-band"
import type { DataTableColumn } from "@/lib/data-table-features"
import { safeUrl } from "@/lib/safe-url"
import { readTableParams, writeTableParams } from "@workspace/api/table-params"
import { buttonLink } from "@/lib/button-link"

import { unlockedQuery } from "../queries/candidate-unlock.queries"
import { type Unlocked } from "../schemas/candidate-unlock.schema"

const rowId = (row: Unlocked) => row.id
const rowLabel = (row: Unlocked) => row.candidate_name ?? row.id

const roleOf = (row: Unlocked) =>
  Object.keys(row.candidate_tech_experience ?? {})[0] ??
  row.candidate_experience?.[0]?.role ??
  null

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

const lpa = (n: number) =>
  Number.isInteger(n) ? String(n) : (Math.round(n * 10) / 10).toString()

export function UnlockedList({
  share,
}: {
  share?: (row: Unlocked) => ReactNode
}) {
  const { t } = useTranslation("unlock")
  const locale = useLocale()
  const [search, setSearch] = useSearchParams()
  const table = readTableParams(search, { sortable: [] })
  const query = useQuery({
    ...unlockedQuery(table.page),
    placeholderData: keepPreviousData,
  })

  const columns = useMemo<DataTableColumn<Unlocked>[]>(() => {
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" })
    return [
      {
        id: "candidate",
        header: t("list.columns.candidate"),
        enableHiding: false,
        cell: ({ row }) => <Person row={row.original} />,
      },
      {
        id: "experience",
        header: t("list.columns.experience"),
        cell: ({ row }) => {
          const years = row.original.candidate_total_experience_years
          return (
            <span className="tabular-nums">
              {years ? t("list.years", { count: Math.round(years) }) : "—"}
            </span>
          )
        },
      },
      {
        id: "place",
        header: t("list.columns.place"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.candidate_location ?? "—"}
          </span>
        ),
      },
      {
        id: "pay",
        header: t("list.columns.pay"),
        cell: ({ row }) => {
          const { candidate_current_ctc: now, candidate_expected_ctc: next } =
            row.original
          return (
            <span className="tabular-nums" dir="ltr">
              {now == null && next == null
                ? "—"
                : [now, next]
                    .map((n) => (n == null ? "—" : lpa(n)))
                    .join(" → ")}
            </span>
          )
        },
      },
      {
        id: "notice",
        header: t("list.columns.notice"),
        cell: ({ row }) => {
          const days = row.original.candidate_notice_period
          return (
            <span className="tabular-nums">
              {days == null ? "—" : t("list.days", { count: days })}
            </span>
          )
        },
      },
      {
        id: "interview",
        header: t("list.columns.interview"),
        cell: ({ row }) =>
          row.original.ai_overall_score == null ? (
            "—"
          ) : (
            <ScoreBand score={row.original.ai_overall_score} of="interview" />
          ),
      },
      {
        id: "unlocked",
        header: t("list.columns.unlocked"),
        cell: ({ row }) => {
          const iso = row.original.unlocked_date
          const when = iso ? new Date(iso) : null
          return (
            <span className="text-muted-foreground">
              {when && !Number.isNaN(when.getTime()) ? date.format(when) : "—"}
            </span>
          )
        },
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => <Actions row={row.original} share={share} />,
      },
    ]
  }, [t, locale, share])

  return (
    <DataTable
      columns={columns}
      data={query.data?.results}
      total={query.data?.count ?? query.data?.results.length ?? 0}
      pageCount={query.data?.total_pages ?? undefined}
      getRowId={rowId}
      rowLabel={rowLabel}
      params={table}
      onParams={(next) => {
        setSearch((prev) => writeTableParams(prev, next), {
          preventScrollReset: true,
        })
      }}
      pending={query.isFetching}
      error={query.isError}
      onRetry={() => void query.refetch()}
      filtered={false}
      onClearFilters={() => undefined}
      empty={
        <EmptyState
          title={t("list.emptyTitle")}
          description={t("list.emptyBody")}
          action={
            <div className="flex flex-col items-center gap-3">
              <AppLink
                to={href("/employer/candidates")}
                className={buttonLink({ variant: "outline" })}
              >
                {t("list.toPool")}
              </AppLink>
              <GuideLink chapter="unlock" />
            </div>
          }
        />
      }
      mobileRow={(row) => (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex items-start justify-between gap-3">
            <span className="flex min-w-0 items-center gap-3">
              <Person row={row} />
            </span>
            {row.ai_overall_score != null && (
              <ScoreBand score={row.ai_overall_score} of="interview" />
            )}
          </div>
          <Actions row={row} share={share} />
        </div>
      )}
    />
  )
}

function Person({ row }: { row: Unlocked }) {
  const { t } = useTranslation("unlock")
  const name = row.candidate_name ?? "—"
  const photo = safeUrl(row.candidate_profile_photo)
  const role = roleOf(row)
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar>
        {photo && <AvatarImage src={photo} alt="" />}
        <AvatarFallback className="text-xs text-foreground">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0">
        <span className="flex items-center gap-1 font-medium">
          <span className="truncate">{name}</span>
          {row.candidate_is_verified && (
            <BadgeCheck
              className="size-4 shrink-0 text-info"
              aria-label={t("list.verified")}
            />
          )}
        </span>
        {role && (
          <span className="block truncate text-xs text-muted-foreground">
            {role}
          </span>
        )}
      </span>
    </span>
  )
}

function Actions({
  row,
  share,
}: {
  row: Unlocked
  share?: (row: Unlocked) => ReactNode
}) {
  const { t } = useTranslation("unlock")
  return (
    <span className="flex gap-2">
      {share?.(row)}
      <AppLink
        to={href("/employer/candidates/:candidateId", { candidateId: row.id })}
        className={buttonLink({ variant: "outline", size: "sm" })}
      >
        {t("list.profile")}
      </AppLink>
      <AppLink
        to={href("/employer/candidates/:candidateId/scorecard", {
          candidateId: row.id,
        })}
        className={buttonLink({ size: "sm" })}
      >
        {t("list.scorecard")}
      </AppLink>
    </span>
  )
}
