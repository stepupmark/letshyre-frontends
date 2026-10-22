import { useLocale, useTranslation } from "@workspace/i18n/react"
import { FileText } from "lucide-react"

import { StatusBadge } from "@/components/status-badge"
import { relativeTime } from "@/lib/relative-time"

import { companyOf } from "../lib/candidate-jobs"
import { closingInDays, isNew } from "../lib/job-facts"
import { type Job } from "../schemas/candidate-jobs.schema"
import {
  ApplicationStatus,
  CompanyLogo,
  Highlight,
  JobFacts,
  SkillList,
} from "./job-parts"

export function JobCard({
  job,
  query,
  onOpen,
}: {
  job: Job
  query: string
  onOpen: () => void
}) {
  const { t } = useTranslation("candidateJobs")
  const locale = useLocale()
  const company = companyOf(job)
  const skills = job.skills_required ?? []
  const summary = job.description?.replace(/\s+/g, " ").trim()
  const closing = closingInDays(job)
  const openings = job.number_of_openings ?? 0

  return (
    <article className="group relative flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors duration-200 hover:border-foreground/25 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 sm:p-5">
      <div className="flex items-start gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="text-base font-semibold tracking-tight text-pretty">
            <button
              type="button"
              onClick={onOpen}
              className="text-start decoration-foreground/30 underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0 after:rounded-lg"
            >
              <Highlight text={job.title ?? t("untitled")} query={query} />
            </button>
          </h3>
          {company && (
            <p className="truncate text-sm font-medium text-muted-foreground">
              {company}
            </p>
          )}
        </div>
        <CompanyLogo job={job} />
      </div>

      <JobFacts job={job} />

      {summary && (
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span className="line-clamp-1">{summary}</span>
        </p>
      )}

      {skills.length > 0 && <SkillList skills={skills} query={query} max={5} />}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
        {isNew(job) && <StatusBadge tone="success">{t("new")}</StatusBadge>}
        {job.created_at && (
          <time dateTime={job.created_at}>
            {relativeTime(job.created_at, locale)}
          </time>
        )}
        {closing !== null && (
          <StatusBadge tone="warning">
            {closing === 0
              ? t("closesToday")
              : t("closesIn", { count: closing })}
          </StatusBadge>
        )}
        {openings > 1 && (
          <span className="tabular-nums">
            {t("facts.openings", { count: openings })}
          </span>
        )}
        {job.status && (
          <span className="ms-auto">
            <ApplicationStatus status={job.status} />
          </span>
        )}
      </div>
    </article>
  )
}
