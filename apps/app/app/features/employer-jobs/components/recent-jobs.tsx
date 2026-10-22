import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, ChevronRight } from "lucide-react"
import * as m from "motion/react-m"
import { useId, useState } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { duration, ease } from "@/lib/motion"

import { statusOf } from "../lib/employer-jobs"
import { placeOf, shortDate } from "../lib/format"
import { jobsQuery } from "../queries/employer-jobs.queries"
import { JobStatusBadge } from "./jobs-list/job-status"

const SHOWN = 5

const newest = (iso: string | null | undefined) => {
  const time = Date.parse(iso ?? "")
  return Number.isNaN(time) ? 0 : time
}

export function RecentJobs() {
  const { t } = useTranslation("jobs")
  const locale = useLocale()
  const id = useId()
  const jobs = useQuery(jobsQuery({ page: 1, tab: "all" }))
  const [enter] = useState(jobs.isPending)
  const rows = jobs.data?.results
    .toSorted((a, b) => newest(b.job_posted_date) - newest(a.job_posted_date))
    .slice(0, SHOWN)

  // the jobs page and the attention list already cover failures and no jobs
  if (jobs.isError || rows?.length === 0) return null

  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={id} className="text-base font-semibold tracking-tight">
          {t("recent.heading")}
        </h2>
        <AppLink
          to={href("/employer/jobs")}
          className="group flex items-center gap-1 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {t("recent.all")}
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
          />
        </AppLink>
      </div>
      <ul className="divide-y overflow-hidden rounded-lg border bg-card">
        {rows
          ? rows.map((job, i) => {
              const meta = [
                placeOf(job),
                shortDate(job.job_posted_date, locale),
              ].filter(Boolean)
              return (
                <m.li
                  key={job.id}
                  initial={enter ? { opacity: 0, y: 6 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: duration.base,
                    ease,
                    delay: i * 0.03,
                  }}
                >
                  <AppLink
                    to={href("/employer/jobs/:jobId", { jobId: job.id })}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:inset-ring-2 focus-visible:inset-ring-ring/50"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">
                        {job.title}
                      </span>
                      {meta.length > 0 && (
                        <span className="truncate text-xs text-muted-foreground tabular-nums">
                          {meta.join(" · ")}
                        </span>
                      )}
                    </span>
                    <JobStatusBadge status={statusOf(job)} />
                    <ChevronRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                    />
                  </AppLink>
                </m.li>
              )
            })
          : [0, 1, 2].map((i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </span>
                <Skeleton className="h-5 w-14 rounded-full" />
              </li>
            ))}
      </ul>
    </section>
  )
}
