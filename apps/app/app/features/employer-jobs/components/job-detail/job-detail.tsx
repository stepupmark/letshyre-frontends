import { HttpError } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { href, useNavigate } from "react-router"
import { toast } from "sonner"

import { AppLink } from "@/components/app-link"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import { QueryState } from "@/components/query-state"
import { buttonLink } from "@/lib/button-link"
import { industriesQuery } from "@/lib/industries"
import { useGo } from "@/lib/navigation"

import { statusOf } from "../../lib/employer-jobs"
import { fromJob } from "../../lib/job-values"
import { useDeleteJob } from "../../mutations/use-job-changes"
import { jobQuery } from "../../queries/employer-jobs.queries"
import type { Job } from "../../schemas/employer-jobs.schema"
import { JobView } from "../job-view"
import { EditJob } from "./edit-job"
import { JobActions } from "./job-actions"
import { JobDetailSkeleton } from "./job-detail-skeleton"
import { JobHeader } from "./job-header"
import { PendingNotice } from "./pending-notice"

export function JobDetail({
  jobId,
  editing,
  onApplicantsIntent,
}: {
  jobId: string
  editing: boolean
  onApplicantsIntent?: () => void
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
    <QueryState
      query={job}
      skeleton={<JobDetailSkeleton />}
      error={{ title: t("detail.errorTitle"), body: t("detail.errorBody") }}
    >
      {(data) => (
        <Loaded
          job={data}
          editing={editing}
          onApplicantsIntent={onApplicantsIntent}
        />
      )}
    </QueryState>
  )
}

function Loaded({
  job,
  editing,
  onApplicantsIntent,
}: {
  job: Job
  editing: boolean
  onApplicantsIntent?: () => void
}) {
  const { t } = useTranslation("jobs")
  const go = useGo()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const industries = useQuery(industriesQuery()).data ?? []
  const remove = useDeleteJob(job.id)
  const status = statusOf(job)
  const values = fromJob(job, industries)

  const setEditing = (on: boolean) => {
    const to = on
      ? href("/employer/jobs/:jobId/edit", { jobId: job.id })
      : href("/employer/jobs/:jobId", { jobId: job.id })
    void navigate(to, { preventScrollReset: true })
  }

  return (
    <div className="flex flex-col gap-8">
      <JobHeader
        job={job}
        editing={editing}
        onApplicantsIntent={onApplicantsIntent}
      />

      {!editing && status === "pending" && <PendingNotice />}

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
