import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { OnChangeFn, RowSelectionState } from "@tanstack/react-table"
import {
  BriefcaseBusiness,
  CalendarPlus,
  CircleCheck,
  CircleX,
  Clock,
  Rows3,
  X,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"

import { DataTable } from "@/components/data-table/data-table"
import { DateRangeFilter } from "@/components/date-range-filter"
import { FilterSelect } from "@/components/filter-select"
import { ListEmptyState } from "@/components/feedback/list-empty-state"
import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { StatCard } from "@/components/stat-card"
import { fetchAllPages } from "@/lib/fetch-all-pages"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatNumber } from "@/lib/format"
import { useSearchState } from "@/lib/search-params"

import { jobsService } from "../services/jobs.service"
import { jobsQueries } from "../queries/jobs.queries"
import { readJobsParams, toJobsFilters } from "../search-params"
import { JobReview } from "./job-review"
import { columns } from "./job-columns"

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
  const [params, setParams] = useSearchState(readJobsParams)
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
              onChange={(value) => {
                setParams({ q: value || null, page: null })
              }}
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
              onChange={(approval) => {
                setParams({ approval, page: null })
              }}
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
              onChange={(status) => {
                setParams({ status, page: null })
              }}
              className="w-36"
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
        data={jobs.data?.results}
        getRowId={(row) => row.id}
        page={params.page}
        pageCount={jobs.data?.total_pages ?? 1}
        totalCount={jobs.data?.count}
        onPageChange={(page) => {
          setParams({ page })
        }}
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
            onClearFilters={() => {
              setParams(null)
            }}
          />
        }
      />
    </>
  )
}
