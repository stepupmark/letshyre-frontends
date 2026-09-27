import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  BadgeCheck,
  CalendarPlus,
  CircleCheck,
  CircleDashed,
  Users,
  X,
} from "lucide-react";
import { useQueryStates } from "nuqs";
import { DataTable } from "~/components/data-table/data-table";
import { EmptyState } from "~/components/feedback/empty-state";
import { FilterSelect } from "~/components/filter-select";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";
import { StatCard } from "~/components/stat-card";
import { StatusBadge } from "~/components/status-badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { RelativeTime } from "~/components/relative-time";
import { useDebouncedValue } from "~/hooks/use-debounced-value";
import { formatNumber } from "~/lib/format";
import { candidatesQueries } from "../queries/candidates.queries";
import {
  GENDERS,
  INDUSTRIES,
  type Candidate,
} from "../schemas/candidates.schema";
import { candidatesSearchParams, toCandidateFilters } from "../search-params";

const columns: ColumnDef<Candidate>[] = [
  {
    id: "candidate",
    header: "Candidate",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name || "Unnamed"}</span>
        <span className="text-xs text-muted-foreground">
          {[row.original.email, row.original.phone_number]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>
    ),
  },
  {
    id: "industry",
    header: "Industry",
    cell: ({ row }) => row.original.preferred_industry || "—",
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => row.original.location || "—",
  },
  {
    id: "profile",
    header: "Profile",
    cell: ({ row }) => (
      <div className="flex w-28 items-center gap-2">
        <Progress value={row.original.profile_completion_score} />
        <span className="text-xs text-muted-foreground tabular-nums">
          {row.original.profile_completion_score}%
        </span>
      </div>
    ),
  },
  {
    id: "kyc",
    header: "KYC",
    cell: ({ row }) => (
      <StatusBadge tone={row.original.is_verified ? "success" : "neutral"}>
        {row.original.is_verified ? "Verified" : "Unverified"}
      </StatusBadge>
    ),
  },
  {
    id: "joined",
    header: "Joined",
    cell: ({ row }) => <RelativeTime value={row.original.created_at} />,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Profile</span>,
    cell: ({ row }) => (
      <Button variant="outline" size="sm" asChild>
        <Link to={`/dashboard/candidates/${row.original.id}`}>View</Link>
      </Button>
    ),
  },
];

function Summary() {
  const summary = useQuery(candidatesQueries.summary());
  if (summary.isError) return null;
  const data = summary.data;
  const loading = summary.isPending;

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Candidates"
        icon={Users}
        loading={loading}
        value={formatNumber(data?.total_candidates)}
      />
      <StatCard
        label="Joined today"
        icon={CalendarPlus}
        loading={loading}
        value={formatNumber(data?.today_registrations)}
      />
      <StatCard
        label="Complete profiles"
        icon={CircleCheck}
        loading={loading}
        value={formatNumber(data?.completed_profiles)}
      />
      <StatCard
        label="Incomplete profiles"
        icon={CircleDashed}
        loading={loading}
        value={formatNumber(data?.in_completed_profiles)}
      />
      <StatCard
        label="Verified"
        icon={BadgeCheck}
        loading={loading}
        value={formatNumber(data?.verified_candidates)}
      />
    </div>
  );
}

export function CandidatesPage() {
  const [params, setParams] = useQueryStates(candidatesSearchParams);
  const q = useDebouncedValue(params.q);
  const candidates = useQuery(
    candidatesQueries.list(toCandidateFilters({ ...params, q })),
  );
  const hasFilters = Boolean(
    params.q ||
    params.gender ||
    params.industry ||
    params.kyc ||
    params.profile,
  );

  return (
    <>
      <PageHeader
        title="Candidates"
        description="Job seekers registered on LetsHyre."
      />
      <Summary />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchInput
          value={params.q}
          placeholder="Search name, email or phone"
          onChange={(value) => void setParams({ q: value || null, page: null })}
        />
        <FilterSelect
          label="Gender"
          allLabel="All genders"
          value={params.gender}
          options={GENDERS}
          onChange={(gender) => void setParams({ gender, page: null })}
          className="w-36"
        />
        <FilterSelect
          label="Industry"
          allLabel="All industries"
          value={params.industry}
          options={INDUSTRIES}
          onChange={(industry) => void setParams({ industry, page: null })}
          className="w-52"
        />
        <FilterSelect
          label="KYC"
          allLabel="Any KYC"
          value={params.kyc}
          options={[
            { value: "verified", label: "Verified" },
            { value: "unverified", label: "Unverified" },
          ]}
          onChange={(kyc) => void setParams({ kyc, page: null })}
          className="w-36"
        />
        <FilterSelect
          label="Profile"
          allLabel="Any profile"
          value={params.profile}
          options={[
            { value: "complete", label: "Complete" },
            { value: "incomplete", label: "Incomplete" },
          ]}
          onChange={(profile) => void setParams({ profile, page: null })}
          className="w-36"
        />
        {hasFilters && (
          <Button variant="ghost" onClick={() => void setParams(null)}>
            <X /> Clear
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={candidates.data?.results}
        getRowId={(row) => row.id}
        page={params.page}
        pageCount={candidates.data?.total_pages ?? 1}
        totalCount={candidates.data?.count}
        onPageChange={(page) => void setParams({ page })}
        isLoading={candidates.isPending}
        error={candidates.error}
        onRetry={() => void candidates.refetch()}
        empty={
          <EmptyState
            title="No candidates found"
            description={hasFilters ? "Try removing some filters." : undefined}
          />
        }
      />
    </>
  );
}
