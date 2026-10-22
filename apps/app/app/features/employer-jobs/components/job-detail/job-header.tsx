import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Users } from "lucide-react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { BackLink } from "@/components/back-link"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { buttonLink } from "@/lib/button-link"

import { statusOf } from "../../lib/employer-jobs"
import { dateLabel } from "../../lib/format"
import type { Job } from "../../schemas/employer-jobs.schema"
import { JobStatusBadge } from "../jobs-list/job-status"

export function JobHeader({
  job,
  editing,
  onApplicantsIntent,
}: {
  job: Job
  editing: boolean
  onApplicantsIntent?: () => void
}) {
  const { t } = useTranslation("jobs")
  const locale = useLocale()
  const posted = dateLabel(job.job_posted_date, locale)

  return (
    <div className="flex flex-col gap-3">
      <BackLink to={href("/employer/jobs")}>{t("detail.back")}</BackLink>
      <PageHeader
        title={job.title}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <JobStatusBadge status={statusOf(job)} />
            {job.ai_generated_jd && (
              <StatusBadge tone="info">{t("detail.aiJd")}</StatusBadge>
            )}
            {posted && (
              <span className="tabular-nums">
                {t("posted", { date: posted })}
              </span>
            )}
          </span>
        }
        actions={
          !editing && (
            <AppLink
              to={href("/employer/jobs/:jobId/applicants", { jobId: job.id })}
              onPointerEnter={onApplicantsIntent}
              onFocus={onApplicantsIntent}
              className={buttonLink()}
            >
              <Users />
              {t("detail.applicants")}
            </AppLink>
          )
        }
      />
    </div>
  )
}
