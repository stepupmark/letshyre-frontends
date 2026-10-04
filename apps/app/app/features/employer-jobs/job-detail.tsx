import { HttpError } from "@workspace/api"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Spinner } from "@workspace/ui/components/spinner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  CircleAlert,
  FileText,
  Pencil,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react"
import * as m from "motion/react-m"
import { useState } from "react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

import { AppLink } from "@/components/app-link"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { QueryState } from "@/components/query-state"
import { StatusBadge } from "@/components/status-badge"
import { industriesQuery } from "@/lib/industries"
import { duration, ease } from "@/lib/motion"
import { safeUrl } from "@/lib/safe-url"
import { useGo } from "@/lib/navigation"
import { undoToast } from "@/lib/undo-toast"

import {
  deleteJob,
  jobQuery,
  JOBS_KEY,
  setJobStatus,
  statusOf,
  updateJob,
  type Job,
  type JobStatus,
} from "./api"
import { dateLabel, statusTone } from "./format"
import { JobForm } from "./job-form"
import { JobView } from "./job-view"
import { useJobForm } from "./use-job-form"
import { fromJob, toPayload, type JobValues } from "./values"

const SETTABLE = ["open", "paused", "closed"] as const

export function JobDetail({ jobId }: { jobId: string }) {
  const { t } = useTranslation("jobs")
  const job = useQuery(jobQuery(jobId))

  if (job.error instanceof HttpError && job.error.status === 404)
    return (
      <EmptyState
        title={t("detail.notFoundTitle")}
        description={t("detail.notFoundBody")}
        action={
          <AppLink
            to="/employer/view-jobs"
            className={buttonVariants({ variant: "outline" })}
          >
            {t("detail.back")}
          </AppLink>
        }
      />
    )

  return (
    <QueryState query={job} skeleton={<DetailSkeleton />}>
      {(data) => <Loaded job={data} />}
    </QueryState>
  )
}

function Loaded({ job }: { job: Job }) {
  const { t } = useTranslation(["jobs", "common"])
  const locale = useLocale()
  const queryClient = useQueryClient()
  const go = useGo()
  const [search, setSearch] = useSearchParams()
  const [deleting, setDeleting] = useState(false)
  const industries = useQuery(industriesQuery()).data ?? []
  const editing = search.get("edit") === "1"
  const status = statusOf(job)
  const key = jobQuery(job.id).queryKey

  const setEditing = (on: boolean) => {
    setSearch(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (on) next.set("edit", "1")
        else next.delete("edit")
        return next
      },
      { preventScrollReset: true }
    )
  }

  const changeStatus = useMutation({
    mutationFn: (next: JobStatus) => setJobStatus(job.id, next),
    onMutate: (next) => {
      queryClient.setQueryData(key, { ...job, status: next })
    },
    onError: () => {
      queryClient.setQueryData(key, job)
      toast.error(t("detail.statusFailed"))
    },
    onSuccess: (_, next) => {
      const before = (job.status ?? "open").toLowerCase() as JobStatus
      undoToast(
        t("detail.statusChanged", { status: t(`statusWord.${next}`) }),
        t("common:undo"),
        () => {
          changeStatus.mutate(before)
        }
      )
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: JOBS_KEY }),
  })

  const remove = useMutation({
    mutationFn: () => deleteJob(job.id),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: key })
      await queryClient.invalidateQueries({ queryKey: JOBS_KEY })
      toast.success(t("detail.deleted"))
      go("/employer/view-jobs", { replace: true })
    },
    onError: () => {
      toast.error(t("detail.deleteFailed"))
    },
  })

  const jdFile = safeUrl(job.jd_file_url)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <AppLink
          to="/employer/view-jobs"
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
                <StatusBadge tone="info">
                  <Sparkles aria-hidden="true" />
                  {t("detail.aiJd")}
                </StatusBadge>
              )}
              {dateLabel(job.job_posted_date, locale) && (
                <span>
                  {t("posted", {
                    date: dateLabel(job.job_posted_date, locale),
                  })}
                </span>
              )}
            </span>
          }
          actions={
            !editing && (
              <AppLink
                to={`/employer/view-jobs/applicants/${job.id}`}
                className={buttonVariants()}
              >
                <Users />
                {t("detail.applicants")}
              </AppLink>
            )
          }
        />
      </div>

      {editing ? (
        <EditJob
          job={job}
          values={fromJob(job, industries)}
          industries={industries}
          onDone={() => {
            setEditing(false)
          }}
        />
      ) : (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: duration.base, ease }}
          className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]"
        >
          <JobView values={fromJob(job, industries)} industries={industries} />
          <aside className="flex flex-col gap-3 lg:sticky lg:top-20">
            {status !== "pending" && (
              <Select
                items={SETTABLE.map((value) => ({
                  value,
                  label: t(`status.${value}`),
                }))}
                value={status}
                onValueChange={(value) => {
                  if (value && value !== status) changeStatus.mutate(value)
                }}
              >
                <SelectTrigger
                  className="w-full"
                  aria-label={t("detail.statusLabel")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SETTABLE.map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`status.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setEditing(true)
              }}
            >
              <Pencil />
              {t("detail.edit")}
            </Button>
            {jdFile && (
              <a
                href={jdFile}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline" })}
              >
                <FileText />
                {t("detail.jdFile")}
              </a>
            )}
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                setDeleting(true)
              }}
            >
              <Trash2 />
              {t("detail.delete")}
            </Button>
          </aside>
        </m.div>
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
          remove.mutate()
        }}
      />
    </div>
  )
}

function EditJob({
  job,
  values,
  industries,
  onDone,
}: {
  job: Job
  values: JobValues
  industries: { value: string; label: string }[]
  onDone: () => void
}) {
  const { t } = useTranslation("jobs")
  const queryClient = useQueryClient()
  const [discarding, setDiscarding] = useState(false)
  const { form, showServerErrors } = useJobForm(values, { isNew: false })

  const save = useMutation({
    mutationFn: (next: JobValues) => updateJob(job.id, toPayload(next)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: JOBS_KEY })
      toast.success(t("detail.saved"))
      onDone()
    },
    onError: (error) => {
      showServerErrors(error)
    },
  })

  return (
    <form
      noValidate
      className="flex max-w-3xl flex-col gap-8"
      onSubmit={(event) => {
        void form.handleSubmit((next) => {
          save.mutate(next)
        })(event)
      }}
    >
      <JobForm form={form} industries={industries} isNew={false} />
      {save.isError && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{t("detail.saveFailed")}</AlertDescription>
        </Alert>
      )}
      <div className="sticky bottom-0 -mx-4 flex gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <Button type="submit" disabled={save.isPending}>
          {save.isPending && <Spinner />}
          {save.isPending ? t("detail.saving") : t("detail.save")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (form.formState.isDirty) setDiscarding(true)
            else onDone()
          }}
        >
          {t("detail.cancel")}
        </Button>
      </div>
      <ConfirmDialog
        open={discarding}
        onOpenChange={setDiscarding}
        title={t("detail.discardTitle")}
        description={t("detail.discardBody")}
        confirmLabel={t("detail.discard")}
        destructive
        onConfirm={onDone}
      />
    </form>
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
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
      <Skeleton className="h-32" />
    </div>
  )
}
