import { Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import {
  BadgeCheck,
  CalendarPlus,
  CircleCheck,
  CircleDashed,
  Users,
  X,
} from "lucide-react"
import { DataTable } from "@/components/data-table/data-table"
import { FilterSelect } from "@/components/filter-select"
import { ListEmptyState } from "@/components/feedback/list-empty-state"
import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { RelativeTime } from "@/components/relative-time"
import { candidatesService } from "../services/candidates.service"
import { fetchAllPages } from "@/lib/fetch-all-pages"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatNumber } from "@/lib/format"
import { candidatesQueries } from "../queries/candidates.queries"
import {
  GENDERS,
  INDUSTRIES,
  type Candidate,
} from "../schemas/candidates.schema"
import { useSearchState } from "@/lib/search-params"
import { readCandidatesParams, toCandidateFilters } from "../search-params"

const columns: ColumnDef<Candidate>[] = [
  {
    id: "candidate",
    meta: {
      csv: (row) => ({
        Name: row.name,
        Email: row.email,
        Phone: row.phone_number,
      }),
    },
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
    meta: { csv: (row) => ({ Industry: row.preferred_industry }) },
    header: "Industry",
    cell: ({ row }) => row.original.preferred_industry || "—",
  },
  {
    id: "location",
    meta: { csv: (row) => ({ Location: row.location }) },
    header: "Location",
    cell: ({ row }) => row.original.location || "—",
  },
  {
    id: "profile",
    meta: { csv: (row) => ({ "Profile %": row.profile_completion_score }) },
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
    meta: {
      csv: (row) => ({ KYC: row.is_verified ? "Verified" : "Unverified" }),
    },
    header: "KYC",
    cell: ({ row }) => (
      <StatusBadge tone={row.original.is_verified ? "success" : "neutral"}>
        {row.original.is_verified ? "Verified" : "Unverified"}
      </StatusBadge>
    ),
  },
  {
    id: "joined",
    meta: { csv: (row) => ({ Joined: row.created_at }) },
    header: "Joined",
    cell: ({ row }) => <RelativeTime value={row.original.created_at} />,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Profile</span>,
    cell: ({ row }) => (
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link to={`/dashboard/candidates/${row.original.id}`} />}
      >
        View
      </Button>
    ),
  },
]

function Summary() {
  const summary = useQuery(candidatesQueries.summary())
  if (summary.isError) return null
  const data = summary.data
  const loading = summary.isPending

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
  )
}

export function CandidatesPage() {
  const [params, setParams] = useSearchState(readCandidatesParams)
  const q = useDebouncedValue(params.q)
  const filters = toCandidateFilters({ ...params, q })
  const candidates = useQuery(candidatesQueries.list(filters))
  const hasFilters = Boolean(
    params.q || params.gender || params.industry || params.kyc || params.profile
  )

  return (
    <>
      <PageHeader
        title="Candidates"
        description="Job seekers registered on LetsHyre."
      />
      <Summary />

      <DataTable
        exportName="candidates"
        exportRows={() =>
          fetchAllPages((page) => candidatesService.list({ ...filters, page }))
        }
        filters={
          <>
            <SearchInput
              value={params.q}
              placeholder="Search name, email or phone"
              onChange={(value) => {
                setParams({ q: value || null, page: null })
              }}
            />
            <FilterSelect
              label="Gender"
              allLabel="All genders"
              value={params.gender}
              options={GENDERS}
              onChange={(gender) => {
                setParams({ gender, page: null })
              }}
              className="w-36"
            />
            <FilterSelect
              label="Industry"
              allLabel="All industries"
              value={params.industry}
              options={INDUSTRIES}
              onChange={(industry) => {
                setParams({ industry, page: null })
              }}
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
              onChange={(kyc) => {
                setParams({ kyc, page: null })
              }}
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
              onChange={(profile) => {
                setParams({ profile, page: null })
              }}
              className="w-36"
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
        data={candidates.data?.results}
        getRowId={(row) => row.id}
        page={params.page}
        pageCount={candidates.data?.total_pages ?? 1}
        totalCount={candidates.data?.count}
        onPageChange={(page) => {
          setParams({ page })
        }}
        isLoading={candidates.isPending}
        error={candidates.error}
        onRetry={() => void candidates.refetch()}
        empty={
          <ListEmptyState
            noun="candidates"
            icon={Users}
            description="Candidates appear here after they sign up."
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
