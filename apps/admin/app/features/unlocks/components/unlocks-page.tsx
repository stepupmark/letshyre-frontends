import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  FileText,
  LockOpen,
  Trophy,
} from "lucide-react";
import { useQueryStates } from "nuqs";
import { DataTable } from "~/components/data-table/data-table";
import { DateRangeFilter } from "~/components/date-range-filter";
import { ExternalLink } from "~/components/external-link";
import { EmptyState } from "~/components/feedback/empty-state";
import { ErrorState } from "~/components/feedback/error-state";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";
import { StatCard } from "~/components/stat-card";
import { StatusBadge } from "~/components/status-badge";
import { Button } from "~/components/ui/button";
import { useDebouncedValue } from "~/hooks/use-debounced-value";
import { formatDate, formatNumber } from "~/lib/format";
import { unlocksQueries } from "../queries/unlocks.queries";
import type { UnlockedProfile } from "../schemas/unlocks.schema";
import { toUnlocksFilters, unlocksSearchParams } from "../search-params";

function growthHint(value: number | null | undefined, period: string) {
  if (value === null || value === undefined) return undefined;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}% vs ${period}`;
}

function ScoreBadge({ score }: { score: number | string | null | undefined }) {
  const value = Number(score);
  if (score === null || score === undefined || Number.isNaN(value))
    return <span className="text-muted-foreground">—</span>;
  const tone = value >= 80 ? "success" : value >= 60 ? "warning" : "danger";
  return <StatusBadge tone={tone}>{Math.round(value)}</StatusBadge>;
}

const columns: ColumnDef<UnlockedProfile, unknown>[] = [
  {
    id: "employer",
    header: "Employer",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.employer ?? "—"}</span>
    ),
  },
  {
    id: "candidate",
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
    header: "Unlocked",
    cell: ({ row }) => formatDate(row.original.unlocked_date),
  },
  {
    id: "score",
    header: "AI score",
    cell: ({ row }) => <ScoreBadge score={row.original.ai_overall_score} />,
  },
  {
    id: "resume",
    header: () => <span className="sr-only">Resume</span>,
    cell: ({ row }) => (
      <Button variant="outline" size="sm" asChild>
        <ExternalLink
          href={row.original.candidate_resume}
          fallback={
            <span className="text-xs text-muted-foreground">No resume</span>
          }
        >
          <FileText /> Resume
        </ExternalLink>
      </Button>
    ),
  },
];

function Overview() {
  const overview = useQuery(unlocksQueries.overview());

  if (overview.isError)
    return (
      <ErrorState
        error={overview.error}
        onRetry={() => void overview.refetch()}
        className="mb-6 rounded-xl border"
      />
    );

  const data = overview.data;
  const loading = overview.isPending;
  const top = data?.top_performer?.top_employer;

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
  );
}

export function UnlocksPage() {
  const [params, setParams] = useQueryStates(unlocksSearchParams);
  const search = useDebouncedValue(params.q);
  const profiles = useQuery(
    unlocksQueries.list(toUnlocksFilters({ ...params, q: search })),
  );

  return (
    <>
      <PageHeader
        title="Unlocks"
        description="Candidate profiles unlocked by employers."
      />
      <Overview />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={params.q}
          placeholder="Search candidates"
          onChange={(q) => void setParams({ q: q || null, page: null })}
        />
        <DateRangeFilter
          from={params.from}
          to={params.to}
          onChange={({ from, to }) =>
            void setParams({ from: from || null, to: to || null, page: null })
          }
        />
      </div>
      <DataTable
        columns={columns}
        data={profiles.data?.results}
        page={params.page}
        pageCount={profiles.data?.total_pages ?? 1}
        totalCount={profiles.data?.count}
        onPageChange={(page) => void setParams({ page })}
        isLoading={profiles.isPending}
        error={profiles.error}
        onRetry={() => void profiles.refetch()}
        empty={
          <EmptyState
            title="No unlocked profiles"
            description="Try a different search or date range."
          />
        }
      />
    </>
  );
}
