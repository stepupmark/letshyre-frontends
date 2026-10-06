import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useCallback, useMemo } from "react"
import { href, useSearchParams } from "react-router"
import { toast } from "sonner"

import { AppLink } from "@/components/app-link"
import { DataTable } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { StatusBadge } from "@/components/status-badge"
import type { DataTableColumn } from "@/lib/data-table-features"
import { readTableParams, writeTableParams } from "@/lib/table-params"
import { undoToast } from "@/lib/undo-toast"
import { buttonLink } from "@/lib/button-link"

import {
  JOB_TABS,
  JOBS_KEY,
  jobsQuery,
  setJobStatus,
  statusOf,
  type Job,
  type JobStatus,
  type JobTab,
} from "./api"
import { dateLabel, experienceOf, placeOf, statusTone } from "./format"

const BULK = [
  { status: "open", label: "list.bulk.open" },
  { status: "paused", label: "list.bulk.pause" },
  { status: "closed", label: "list.bulk.close" },
] as const

const rowId = (job: Job) => job.id
const rowLabel = (job: Job) => job.title ?? job.id

// the status a job can be set back to; pending is the approval, not a status
const ownStatus = (job: Job): JobStatus => {
  const status = (job.status ?? "open").toLowerCase()
  return status === "paused" || status === "closed" ? status : "open"
}

export function JobsList() {
  const { t } = useTranslation(["jobs", "common"])
  const locale = useLocale()
  const queryClient = useQueryClient()
  const [search, setSearch] = useSearchParams()
  const table = readTableParams(search, { sortable: [] })
  const raw = search.get("status")?.toLowerCase()
  const tab: JobTab = JOB_TABS.find((x) => x === raw) ?? "all"
  const jobs = useQuery({
    ...jobsQuery({ page: table.page, tab }),
    placeholderData: keepPreviousData,
  })
  const rows = jobs.data?.results

  const years = useCallback(
    (job: Job) => {
      const range = experienceOf(job)
      if (!range) return t("notGiven")
      if (range.max === 0) return t("fresher")
      return range.min === range.max
        ? t("yearsExact", { count: range.min })
        : t("years", range)
    },
    [t]
  )

  const columns = useMemo<DataTableColumn<Job>[]>(
    () => [
      {
        id: "title",
        header: t("list.columns.title"),
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col">
            <AppLink
              to={href("/employer/jobs/:jobId", { jobId: row.original.id })}
              data-row-open=""
              className="w-fit truncate font-medium outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {row.original.title}
            </AppLink>
            <span className="text-xs text-muted-foreground">
              {t("posted", {
                date: dateLabel(row.original.job_posted_date, locale) ?? "—",
              })}
            </span>
          </div>
        ),
      },
      {
        id: "status",
        header: t("list.columns.status"),
        cell: ({ row }) => {
          const status = statusOf(row.original)
          return (
            <StatusBadge tone={statusTone[status]}>
              {t(`status.${status}`)}
            </StatusBadge>
          )
        },
      },
      {
        id: "place",
        header: t("list.columns.place"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {placeOf(row.original) ?? "—"}
          </span>
        ),
      },
      {
        id: "experience",
        header: t("list.columns.experience"),
        cell: ({ row }) => (
          <span className="tabular-nums">{years(row.original)}</span>
        ),
      },
    ],
    [t, locale, years]
  )

  const change = useMutation({
    mutationFn: async ({
      ids,
      status,
    }: {
      ids: string[]
      status: JobStatus
    }) => {
      const results = await Promise.allSettled(
        ids.map((id) => setJobStatus(id, status))
      )
      return ids.filter((_, i) => results[i]?.status === "fulfilled")
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: JOBS_KEY }),
  })

  const apply = (ids: string[], status: JobStatus, clear: () => void) => {
    const before = new Map(
      (rows ?? []).map((job) => [job.id, ownStatus(job)] as const)
    )
    change.mutate(
      { ids, status },
      {
        onSuccess: (done) => {
          clear()
          const failed = ids.length - done.length
          if (failed) toast.error(t("list.changeFailed", { count: failed }))
          if (!done.length) return
          undoToast(
            t("list.changed", {
              count: done.length,
              status: t(`statusWord.${status}`),
            }),
            t("common:undo"),
            () => {
              void Promise.allSettled(
                done.map((id) => setJobStatus(id, before.get(id) ?? "open"))
              ).then(async () => {
                await queryClient.invalidateQueries({ queryKey: JOBS_KEY })
                toast(t("list.undone"))
              })
            }
          )
        },
      }
    )
  }

  const setTab = (next: JobTab) => {
    setSearch(
      (prev) =>
        writeTableParams(prev, {
          filters: { status: next === "all" ? null : next },
        }),
      { preventScrollReset: true }
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as JobTab)
        }}
      >
        <div className="-mx-4 scrollbar-none overflow-x-auto px-4">
          <TabsList>
            {JOB_TABS.map((x) => (
              <TabsTrigger key={x} value={x}>
                {t(`list.tabs.${x}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      <DataTable
        columns={columns}
        data={rows}
        total={jobs.data?.count ?? rows?.length ?? 0}
        pageCount={jobs.data?.total_pages ?? undefined}
        getRowId={rowId}
        rowLabel={rowLabel}
        params={table}
        onParams={(next) => {
          setSearch((prev) => writeTableParams(prev, next), {
            preventScrollReset: true,
          })
        }}
        pending={jobs.isFetching}
        error={jobs.isError}
        onRetry={() => void jobs.refetch()}
        filtered={tab !== "all"}
        onClearFilters={() => {
          setTab("all")
        }}
        onOpen={() => undefined}
        empty={
          <EmptyState
            title={t("list.emptyTitle")}
            description={t("list.emptyBody")}
            action={
              <AppLink to={href("/employer/jobs/new")} className={buttonLink()}>
                <Plus />
                {t("list.postJob")}
              </AppLink>
            }
          />
        }
        bulkActions={(ids, clear) =>
          BULK.map(({ status, label }) => (
            <Button
              key={status}
              size="sm"
              variant={status === "open" ? "default" : "outline"}
              disabled={change.isPending}
              onClick={() => {
                apply(ids, status, clear)
              }}
            >
              {t(label)}
            </Button>
          ))
        }
        mobileRow={(job) => {
          const status = statusOf(job)
          return (
            <AppLink
              to={href("/employer/jobs/:jobId", { jobId: job.id })}
              className="flex flex-col gap-2 rounded-lg border p-4 transition-colors active:bg-muted"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0 truncate font-medium">
                  {job.title}
                </span>
                <StatusBadge tone={statusTone[status]}>
                  {t(`status.${status}`)}
                </StatusBadge>
              </span>
              <span className="text-xs text-muted-foreground">
                {[placeOf(job), years(job)].filter(Boolean).join(" · ")}
              </span>
            </AppLink>
          )
        }}
      />
    </div>
  )
}
