import { HttpError } from "@workspace/api"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Hourglass, Users } from "lucide-react"
import { useState } from "react"
import { href, useNavigate } from "react-router"
import { toast } from "sonner"

import { AppLink } from "@/components/app-link"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { QueryState } from "@/components/query-state"
import { StatusBadge } from "@/components/status-badge"
import { buttonLink } from "@/lib/button-link"
import { industriesQuery } from "@/lib/industries"
import { useGo } from "@/lib/navigation"

import { statusOf } from "../../lib/employer-jobs"
import { dateLabel, statusTone } from "../../lib/format"
import { fromJob } from "../../lib/job-values"
import { useDeleteJob } from "../../mutations/use-job-changes"
import { jobQuery } from "../../queries/employer-jobs.queries"
import type { Job } from "../../schemas/employer-jobs.schema"
import { JobView } from "../job-view"
import { EditJob } from "./edit-job"
import { JobActions } from "./job-actions"

export function JobDetail({
  jobId,
  editing,
}: {
  jobId: string
  editing: boolean
}) {
  const { t } = useTranslation("jobs")
  const job = useQuery(jobQuery(jobId))

  if (job.error instanceof HttpError && job.error.status === 404)
    return (
      <EmptyState
        title={t("detail.notFoundTitle")}
        description={t("detail.notFoundBody")}
        action={
          <AppLink
            to={href("/employer/jobs")}
            className={buttonLink({ variant: "outline" })}
          >
            {t("detail.back")}
          </AppLink>
        }
      />
    )

  return (
    <QueryState query={job} skeleton={<DetailSkeleton />}>
      {(data) => <Loaded job={data} editing={editing} />}
    </QueryState>
  )
}

function Loaded({ job, editing }: { job: Job; editing: boolean }) {
  const { t } = useTranslation("jobs")
  const locale = useLocale()
  const go = useGo()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const industries = useQuery(industriesQuery()).data ?? []
  const remove = useDeleteJob(job.id)
  const status = statusOf(job)
  const values = fromJob(job, industries)
  const posted = dateLabel(job.job_posted_date, locale)

  const setEditing = (on: boolean) => {
    const to = on
      ? href("/employer/jobs/:jobId/edit", { jobId: job.id })
      : href("/employer/jobs/:jobId", { jobId: job.id })
    void navigate(to, { preventScrollReset: true })
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <AppLink
          to={href("/employer/jobs")}
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" />
          {t("detail.back")}
        </AppLink>
        <PageHeader
          title={job.title}
          description={
            <span className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={statusTone[status]}>
                {t(`status.${status}`)}
              </StatusBadge>
              {job.ai_generated_jd && (
                <StatusBadge tone="info">{t("detail.aiJd")}</StatusBadge>
              )}
              {posted && <span>{t("posted", { date: posted })}</span>}
            </span>
          }
          actions={
            !editing && (
              <AppLink
                to={href("/employer/jobs/:jobId/applicants", { jobId: job.id })}
                className={buttonLink()}
              >
                <Users />
                {t("detail.applicants")}
              </AppLink>
            )
          }
        />
      </div>

      {!editing && status === "pending" && (
        <div className="settle flex items-start gap-3 rounded-2xl border p-4">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-warning-muted text-warning [&_svg]:size-4"
          >
            <Hourglass />
          </span>
          <div className="flex flex-col gap-0.5 text-sm">
            <p className="font-medium">{t("detail.pendingTitle")}</p>
            <p className="text-pretty text-muted-foreground">
              {t("detail.pendingBody")}
            </p>
          </div>
        </div>
      )}

      {editing ? (
        <EditJob
          jobId={job.id}
          values={values}
          industries={industries}
          onDone={() => {
            setEditing(false)
          }}
        />
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <JobView values={values} industries={industries} />
          <JobActions
            job={job}
            onEdit={() => {
              setEditing(true)
            }}
            onDelete={() => {
              setDeleting(true)
            }}
          />
        </div>
      )}

      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={t("detail.deleteTitle")}
        description={t("detail.deleteBody")}
        confirmLabel={t("detail.deleteConfirm")}
        pending={remove.isPending}
        destructive
        onConfirm={() => {
          remove.mutate(undefined, {
            onSuccess: () => {
              toast.success(t("detail.deleted"))
              go(href("/employer/jobs"), { replace: true })
            },
            onError: () => {
              toast.error(t("detail.deleteFailed"))
            },
          })
        }}
      />
    </div>
  )
}

function DetailSkeleton() {
  const { t } = useTranslation("common")
  return (
    <div
      role="status"
      aria-label={t("state.loading")}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-15 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-32" />
    </div>
  )
}
