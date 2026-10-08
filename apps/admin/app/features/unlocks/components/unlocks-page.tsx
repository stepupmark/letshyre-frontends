import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import {
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  FileText,
  LockOpen,
  Trophy,
  Unlock,
  X,
} from "lucide-react"
import { DataTable } from "@/components/data-table/data-table"
import { DateRangeFilter } from "@/components/date-range-filter"
import { ExternalLink } from "@/components/external-link"
import { ErrorState } from "@/components/feedback/error-state"
import { ListEmptyState } from "@/components/feedback/list-empty-state"
import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@workspace/ui/components/button"
import { RelativeTime } from "@/components/relative-time"
import { unlocksService } from "../services/unlocks.service"
import { fetchAllPages } from "@/lib/fetch-all-pages"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatNumber } from "@/lib/format"
import { unlocksQueries } from "../queries/unlocks.queries"
import type { UnlockedProfile } from "../schemas/unlocks.schema"
import { useSearchState } from "@/lib/search-params"
import { toUnlocksFilters, readUnlocksParams } from "../search-params"

function growthHint(value: number | null | undefined, period: string) {
  if (value === null || value === undefined) return undefined
  const sign = value > 0 ? "+" : ""
  return `${sign}${value}% vs ${period}`
}

function ScoreBadge({ score }: { score: number | string | null | undefined }) {
  const value = Number(score)
  if (score === null || score === undefined || Number.isNaN(value))
    return <span className="text-muted-foreground">—</span>
  const tone = value >= 80 ? "success" : value >= 60 ? "warning" : "danger"
  return <StatusBadge tone={tone}>{Math.round(value)}</StatusBadge>
}

const columns: ColumnDef<UnlockedProfile>[] = [
  {
    id: "employer",
    meta: { csv: (row) => ({ Employer: row.employer }) },
    header: "Employer",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.employer ?? "—"}</span>
    ),
  },
  {
    id: "candidate",
    meta: {
      csv: (row) => ({
        Candidate: row.candidate_name,
        Email: row.candidate_email,
        Phone: row.candidate_phone,
      }),
    },
    header: "Candidate",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">
          {row.original.candidate_name || "Unknown"}
        </span>
        <span className="text-xs text-muted-foreground">
          {[row.original.candidate_email, row.original.candidate_phone]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>
    ),
  },
  {
    id: "unlocked",
    meta: { csv: (row) => ({ Unlocked: row.unlocked_date }) },
    header: "Unlocked",
    cell: ({ row }) => <RelativeTime value={row.original.unlocked_date} />,
  },
  {
    id: "score",
    meta: { csv: (row) => ({ "AI score": row.ai_overall_score }) },
    header: "AI score",
    cell: ({ row }) => <ScoreBadge score={row.original.ai_overall_score} />,
  },
  {
    id: "resume",
    header: () => <span className="sr-only">Resume</span>,
    cell: ({ row }) => (
      <Button
        variant="outline"
        size="sm"
        render={
          <ExternalLink
            href={row.original.candidate_resume}
            fallback={
              <span className="text-xs text-muted-foreground">No resume</span>
            }
          />
        }
      >
        <FileText /> Resume
      </Button>
    ),
  },
]

function Overview() {
  const overview = useQuery(unlocksQueries.overview())

  if (overview.isError)
    return (
      <ErrorState
        error={overview.error}
        onRetry={() => void overview.refetch()}
        className="mb-6 rounded-xl border"
      />
    )

  const data = overview.data
  const loading = overview.isPending
  const top = data?.top_performer?.top_employer

  return (
    <div className="mb-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total unlocks"
          icon={LockOpen}
          loading={loading}
          value={formatNumber(data?.summary.total_unlocks)}
        />
        <StatCard
          label="Today"
          icon={CalendarCheck}
          loading={loading}
          value={formatNumber(data?.summary.today_unlocks)}
          hint={growthHint(data?.growth?.today_vs_yesterday, "yesterday")}
        />
        <StatCard
          label="This week"
          icon={CalendarDays}
          loading={loading}
          value={formatNumber(data?.summary.week_unlocks)}
          hint={growthHint(data?.growth?.week_vs_last_week, "last week")}
        />
        <StatCard
          label="This month"
          icon={CalendarRange}
          loading={loading}
          value={formatNumber(data?.summary.month_unlocks)}
          hint={growthHint(data?.growth?.month_vs_last_month, "last month")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Unique employers"
          loading={loading}
          value={formatNumber(data?.engagement.unique_employers)}
        />
        <StatCard
          label="Unique candidates"
          loading={loading}
          value={formatNumber(data?.engagement.unique_candidates)}
        />
        <StatCard
          label="Average AI score"
          loading={loading}
          value={
            <>
              {data?.engagement.avg_ai_score ?? 0}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / 100
              </span>
            </>
          }
        />
        <StatCard
          label="Top employer"
          icon={Trophy}
          loading={loading}
          value={
            <span className="block truncate text-lg">
              {top?.employer__user__name ?? "—"}
            </span>
          }
          hint={top ? `${formatNumber(top.total)} unlocks` : undefined}
        />
      </div>
    </div>
  )
}

export function UnlocksPage() {
  const [params, setParams] = useSearchState(readUnlocksParams)
  const search = useDebouncedValue(params.q)
  const filters = toUnlocksFilters({ ...params, q: search })
  const profiles = useQuery(unlocksQueries.list(filters))
  const hasFilters = Boolean(params.q || params.from || params.to)

  return (
    <>
      <PageHeader
        title="Unlocks"
        description="Candidate profiles unlocked by employers."
      />
      <Overview />
      <DataTable
        exportName="unlocks"
        exportRows={() =>
          fetchAllPages((page) => unlocksService.list({ ...filters, page }))
        }
        filters={
          <>
            <SearchInput
              value={params.q}
              placeholder="Search candidates"
              onChange={(q) => {
                setParams({ q: q || null, page: null })
              }}
            />
            <DateRangeFilter
              from={params.from}
              to={params.to}
              onChange={({ from, to }) => {
                setParams({
                  from: from || null,
                  to: to || null,
                  page: null,
                })
              }}
            />
            {hasFilters && (
              <Button
                variant="ghost"
                onClick={() => {
                  setParams(null)
                }}
              >
                <X /> Clear
              </Button>
            )}
          </>
        }
        columns={columns}
        data={profiles.data?.results}
        page={params.page}
        pageCount={profiles.data?.total_pages ?? 1}
        totalCount={profiles.data?.count}
        onPageChange={(page) => {
          setParams({ page })
        }}
        isLoading={profiles.isPending}
        error={profiles.error}
        onRetry={() => void profiles.refetch()}
        empty={
          <ListEmptyState
            noun="unlocked profiles"
            icon={Unlock}
            description="Profiles appear here when employers unlock candidates."
            filtered={hasFilters}
            onClearFilters={() => {
              setParams(null)
            }}
          />
        }
      />
    </>
  )
}
