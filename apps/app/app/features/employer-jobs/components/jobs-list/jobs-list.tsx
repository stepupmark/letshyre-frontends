import { useTranslation } from "@workspace/i18n/react"
import { readTableParams, writeTableParams } from "@workspace/api/table-params"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { href, useSearchParams } from "react-router"

import { AppLink } from "@/components/app-link"
import { DataTable } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { GuideLink } from "@/components/guide-link"
import { buttonLink } from "@/lib/button-link"

import { JOB_TABS } from "../../lib/employer-jobs"
import { jobsQuery } from "../../queries/employer-jobs.queries"
import type { Job } from "../../schemas/employer-jobs.schema"
import type { JobTab } from "../../types"
import { EmptyJobsArt } from "../art/jd-art"
import { BulkActions } from "./bulk-actions"
import { JobCard } from "./job-card"
import { useJobColumns } from "./job-columns"
import { JobTabs } from "./job-tabs"

const rowId = (job: Job) => job.id
const rowLabel = (job: Job) => job.title ?? job.id

export function JobsList() {
  const { t } = useTranslation("jobs")
  const [search, setSearch] = useSearchParams()
  const table = readTableParams(search, { sortable: [] })
  const raw = search.get("status")?.toLowerCase()
  const tab: JobTab = JOB_TABS.find((x) => x === raw) ?? "all"
  const jobs = useQuery({
    ...jobsQuery({ page: table.page, tab }),
    placeholderData: keepPreviousData,
  })
  const columns = useJobColumns()
  const rows = jobs.data?.results

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
      <JobTabs value={tab} onChange={setTab} />

      <DataTable
        columns={columns}
        data={rows}
        total={jobs.data?.count ?? rows?.length ?? 0}
        pageCount={jobs.data?.total_pages ?? undefined}
        getRowId={rowId}
        rowLabel={rowLabel}
        label={t("list.title")}
        filterKey={tab}
        params={table}
        onParams={(next) => {
          setSearch((prev) => writeTableParams(prev, next), {
            preventScrollReset: true,
          })
        }}
        pending={jobs.isFetching}
        error={jobs.isError}
        onRetry={() => void jobs.refetch()}
        loadError={{
          title: t("list.errorTitle"),
          body: t("list.errorBody"),
        }}
        filtered={tab !== "all"}
        onClearFilters={() => {
          setTab("all")
        }}
        keyboard
        empty={
          <EmptyState
            art={<EmptyJobsArt />}
            title={t("list.emptyTitle")}
            description={t("list.emptyBody")}
            action={
              <div className="flex flex-col items-center gap-3">
                <AppLink
                  to={href("/employer/jobs/new")}
                  className={buttonLink()}
                >
                  <Plus />
                  {t("list.postJob")}
                </AppLink>
                <GuideLink chapter="post" />
              </div>
            }
          />
        }
        bulkActions={(ids, clear) => (
          <BulkActions jobs={rows ?? []} ids={ids} clear={clear} />
        )}
        mobileRow={(job, select) => <JobCard job={job} select={select} />}
      />
    </div>
  )
}
