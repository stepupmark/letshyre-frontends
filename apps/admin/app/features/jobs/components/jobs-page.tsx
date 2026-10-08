import { useState } from "react"
import { Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import type {
  ColumnDef,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"
import {
  BriefcaseBusiness,
  CalendarPlus,
  CircleCheck,
  CircleX,
  Clock,
  Rows3,
  X,
} from "lucide-react"
import { useQueryStates } from "nuqs"
import { DataTable } from "@/components/data-table/data-table"
import { DateRangeFilter } from "@/components/date-range-filter"
import { FilterSelect } from "@/components/filter-select"
import { ListEmptyState } from "@/components/feedback/list-empty-state"
import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RelativeTime } from "@/components/relative-time"
import { jobsService } from "../services/jobs.service"
import { fetchAllPages } from "@/lib/fetch-all-pages"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatNumber } from "@/lib/format"
import { jobsQueries } from "../queries/jobs.queries"
import type { Job } from "../schemas/jobs.schema"
import { jobsSearchParams, toJobsFilters } from "../search-params"
import { ApprovalBadge, JobStatusBadge } from "./job-badges"
import { JobReview } from "./job-review"

const columns: ColumnDef<Job>[] = [
  {
    id: "select",
    size: 40,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all on this page"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(checked) => {
          table.toggleAllPageRowsSelected(checked === true)
        }}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select ${row.original.title ?? "job"}`}
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => {
          row.toggleSelected(checked === true)
        }}
      />
    ),
  },
  {
    id: "job",
    meta: {
      csv: (row) => ({
        Title: row.title,
        Company: row.company_name,
        Employer: row.employer_name,
      }),
    },
    header: "Job",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <Link
          to={`/dashboard/jobs/${row.original.id}`}
          className="font-medium underline-offset-4 hover:underline"
        >
          {row.original.title || "Untitled job"}
        </Link>
        <span className="text-xs text-muted-foreground">
          {[row.original.company_name, row.original.employer_name]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>
    ),
  },
  {
    id: "type",
    meta: {
      csv: (row) => ({
        "Employment type": row.employment_type,
        Industry: row.industry_type,
      }),
    },
    header: "Type",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs">
        <span className="capitalize">
          {row.original.employment_type?.replace(/_/g, " ") || "—"}
        </span>
        <span className="text-muted-foreground">
          {row.original.industry_type}
        </span>
      </div>
    ),
  },
  {
    id: "applications",
    meta: {
      align: "right",
      csv: (row) => ({ Applicants: row.applications_count }),
    },
    header: "Applicants",
    cell: ({ row }) => formatNumber(row.original.applications_count),
  },
  {
    id: "status",
    meta: { csv: (row) => ({ Status: row.status }) },
    header: "Status",
    cell: ({ row }) => <JobStatusBadge status={row.original.status} />,
  },
  {
    id: "approval",
    meta: { csv: (row) => ({ Review: row.approval }) },
    header: "Review",
    cell: ({ row }) => <ApprovalBadge status={row.original.approval} />,
  },
  {
    id: "posted",
    meta: { csv: (row) => ({ Posted: row.created_at }) },
    header: "Posted",
    cell: ({ row }) => <RelativeTime value={row.original.created_at} />,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <JobReview
        jobIds={[row.original.id]}
        approval={row.original.approval}
        size="sm"
      />
    ),
  },
]

function Summary() {
  const summary = useQuery(jobsQueries.summary())
  if (summary.isError) return null
  const data = summary.data
  const loading = summary.isPending

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Job posts"
        icon={BriefcaseBusiness}
        loading={loading}
        value={formatNumber(data?.total_post_jobs)}
      />
      <StatCard
        label="Posted today"
        icon={CalendarPlus}
        loading={loading}
        value={formatNumber(data?.today_job_posts)}
      />
      <StatCard
        label="Awaiting review"
        icon={Clock}
        loading={loading}
        value={formatNumber(data?.pending_approvals)}
      />
      <StatCard
        label="Approved"
        icon={CircleCheck}
        loading={loading}
        value={formatNumber(data?.approved_jobs)}
      />
      <StatCard
        label="Rejected"
        icon={CircleX}
        loading={loading}
        value={formatNumber(data?.rejected_jobs)}
      />
    </div>
  )
}

export function JobsPage() {
  const [params, setParams] = useQueryStates(jobsSearchParams)
  const q = useDebouncedValue(params.q)
  const filters = toJobsFilters({ ...params, q })
  const jobs = useQuery(jobsQueries.list(filters))

  // selection belongs to the rows on screen, so it resets when filters or page change
  const selectionKey = JSON.stringify(filters)
  const [selection, setSelection] = useState<{
    key: string
    rows: RowSelectionState
  }>({
    key: selectionKey,
    rows: {},
  })
  const rowSelection = selection.key === selectionKey ? selection.rows : {}
  const onRowSelectionChange: OnChangeFn<RowSelectionState> = (updater) => {
    setSelection((previous) => {
      const current = previous.key === selectionKey ? previous.rows : {}
      return {
        key: selectionKey,
        rows: typeof updater === "function" ? updater(current) : updater,
      }
    })
  }
  const selectedIds = (jobs.data?.results ?? [])
    .map((job) => job.id)
    .filter((id) => rowSelection[id])
  const clearSelection = () => {
    setSelection({ key: selectionKey, rows: {} })
  }

  const hasFilters = Boolean(
    params.q || params.status || params.approval || params.from || params.to
  )

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Review job posts before candidates can see them."
      />
      <Summary />

      <DataTable
        exportName="jobs"
        exportRows={() =>
          fetchAllPages((page) => jobsService.list({ ...filters, page }))
        }
        banner={
          selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/50 px-3 py-2">
              <span className="text-sm">
                {selectedIds.length} selected
                <Button variant="link" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </span>
              <JobReview
                jobIds={selectedIds}
                size="sm"
                onDone={clearSelection}
              />
            </div>
          )
        }
        filters={
          <>
            <SearchInput
              value={params.q}
              placeholder="Search title or company"
              onChange={(value) =>
                void setParams({ q: value || null, page: null })
              }
            />
            <FilterSelect
              label="Review"
              allLabel="Any review"
              value={params.approval}
              options={[
                { value: "pending", label: "Pending review" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ]}
              onChange={(approval) => void setParams({ approval, page: null })}
            />
            <FilterSelect
              label="Status"
              allLabel="Any status"
              value={params.status}
              options={[
                { value: "open", label: "Open" },
                { value: "paused", label: "Paused" },
                { value: "closed", label: "Closed" },
              ]}
              onChange={(status) => void setParams({ status, page: null })}
              className="w-36"
            />
            <DateRangeFilter
              from={params.from}
              to={params.to}
              onChange={({ from, to }) =>
                void setParams({
                  from: from || null,
                  to: to || null,
                  page: null,
                })
              }
            />
            {hasFilters && (
              <Button variant="ghost" onClick={() => void setParams(null)}>
                <X /> Clear
              </Button>
            )}
          </>
        }
        columns={columns}
        data={jobs.data?.results}
        getRowId={(row) => row.id}
        page={params.page}
        pageCount={jobs.data?.total_pages ?? 1}
        totalCount={jobs.data?.count}
        onPageChange={(page) => void setParams({ page })}
        isLoading={jobs.isPending}
        error={jobs.error}
        onRetry={() => void jobs.refetch()}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        empty={
          <ListEmptyState
            noun="jobs"
            icon={Rows3}
            description="Jobs appear here when employers post them."
            filtered={hasFilters}
            onClearFilters={() => void setParams(null)}
          />
        }
      />
    </>
  )
}
