import { useLocale, useTranslation } from "@workspace/i18n/react"
import { useMemo } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import type { DataTableColumn } from "@/lib/data-table-features"

import { useJobFacts } from "../../hooks/use-job-facts"
import { statusOf } from "../../lib/employer-jobs"
import { placeOf, shortDate } from "../../lib/format"
import type { Job } from "../../schemas/employer-jobs.schema"
import { Blank, JobStatusBadge } from "./job-status"

export function useJobColumns() {
  const { t } = useTranslation("jobs")
  const locale = useLocale()
  const facts = useJobFacts()

  // the table needs stable columns, or it rebuilds every row on each render
  return useMemo<DataTableColumn<Job>[]>(
    () => [
      {
        id: "title",
        header: t("list.columns.title"),
        enableHiding: false,
        cell: ({ row }) => {
          const job = row.original
          const meta = facts.meta(job)
          return (
            <div className="flex max-w-md min-w-48 flex-col gap-0.5">
              <AppLink
                to={href("/employer/jobs/:jobId", { jobId: job.id })}
                data-row-open=""
                title={job.title ?? undefined}
                className="line-clamp-2 w-fit rounded-sm font-medium text-pretty underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {job.title}
              </AppLink>
              {meta.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {meta.join(" · ")}
                </span>
              )}
            </div>
          )
        },
      },
      {
        id: "status",
        header: t("list.columns.status"),
        cell: ({ row }) => <JobStatusBadge status={statusOf(row.original)} />,
      },
      {
        id: "place",
        header: t("list.columns.place"),
        cell: ({ row }) => {
          const place = placeOf(row.original)
          return place ? (
            <span className="block max-w-48 truncate text-muted-foreground">
              {place}
            </span>
          ) : (
            <Blank />
          )
        },
      },
      {
        id: "experience",
        header: t("list.columns.experience"),
        cell: ({ row }) => {
          const years = facts.years(row.original)
          return years ? (
            <span className="whitespace-nowrap tabular-nums">{years}</span>
          ) : (
            <Blank />
          )
        },
      },
      {
        id: "salary",
        header: t("list.columns.salary"),
        cell: ({ row }) => {
          const salary = facts.salary(row.original)
          return salary ? (
            <span className="whitespace-nowrap tabular-nums">{salary}</span>
          ) : (
            <Blank />
          )
        },
      },
      {
        id: "posted",
        header: t("list.columns.posted"),
        cell: ({ row }) => {
          const date = shortDate(row.original.job_posted_date, locale)
          return date ? (
            <span className="whitespace-nowrap text-muted-foreground tabular-nums">
              {date}
            </span>
          ) : (
            <Blank />
          )
        },
      },
    ],
    [t, locale, facts]
  )
}
