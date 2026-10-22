import { useLocale } from "@workspace/i18n/react"
import type { ReactNode } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"

import { useJobFacts } from "../../hooks/use-job-facts"
import { statusOf } from "../../lib/employer-jobs"
import { placeOf, shortDate } from "../../lib/format"
import type { Job } from "../../schemas/employer-jobs.schema"
import { JobStatusBadge } from "./job-status"

export function JobCard({ job, select }: { job: Job; select: ReactNode }) {
  const locale = useLocale()
  const facts = useJobFacts()
  const details = [
    placeOf(job),
    facts.years(job),
    shortDate(job.job_posted_date, locale),
  ].filter(Boolean)

  return (
    <article className="flex items-start gap-3 rounded-lg border bg-card p-4">
      {select && <span className="flex h-6 items-center">{select}</span>}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <AppLink
            to={href("/employer/jobs/:jobId", { jobId: job.id })}
            className="line-clamp-2 min-w-0 rounded-sm font-medium text-pretty underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {job.title}
          </AppLink>
          <JobStatusBadge status={statusOf(job)} />
        </div>
        {details.length > 0 && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {details.join(" · ")}
          </p>
        )}
      </div>
    </article>
  )
}
