import { safeUrl } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { FileText, Pencil, Trash2 } from "lucide-react"
import { useId } from "react"
import { toast } from "sonner"

import { buttonLink } from "@/lib/button-link"
import { undoToast } from "@/lib/undo-toast"

import { ownStatus, statusOf } from "../../lib/employer-jobs"
import { useSetJobStatus } from "../../mutations/use-job-changes"
import type { Job } from "../../schemas/employer-jobs.schema"
import type { JobStatus } from "../../types"

const SETTABLE = ["open", "paused", "closed"] as const

export function JobActions({
  job,
  onEdit,
  onDelete,
}: {
  job: Job
  onEdit: () => void
  onDelete: () => void
}) {
  const { t } = useTranslation(["jobs", "common"])
  const id = useId()
  const status = statusOf(job)
  const changeStatus = useSetJobStatus(job)
  const jdFile = safeUrl(job.jd_file_url)

  const setStatus = (next: JobStatus) => {
    const before = ownStatus(job)
    changeStatus.mutate(next, {
      onError: () => {
        toast.error(t("detail.statusFailed"))
      },
      onSuccess: () => {
        undoToast(
          t("detail.statusChanged", { status: t(`statusWord.${next}`) }),
          t("common:undo"),
          () => {
            changeStatus.mutate(before, {
              onError: () => {
                toast.error(t("detail.statusFailed"))
              },
            })
          }
        )
      },
    })
  }

  return (
    <aside
      aria-labelledby={id}
      className="settle flex flex-col gap-4 rounded-lg border bg-card p-4 lg:sticky lg:top-20"
    >
      <h2 id={id} className="text-sm font-semibold">
        {t("detail.manage")}
      </h2>
      {status === "pending" ? (
        <p className="border-b pb-4 text-sm text-pretty text-muted-foreground">
          {t("detail.pendingStatus")}
        </p>
      ) : (
        <Field className="border-b pb-4">
          <FieldLabel htmlFor={`${id}-status`}>
            {t("detail.statusLabel")}
          </FieldLabel>
          <Select
            items={SETTABLE.map((value) => ({
              value,
              label: t(`status.${value}`),
            }))}
            value={status}
            onValueChange={(value) => {
              if (value && value !== status) setStatus(value)
            }}
          >
            <SelectTrigger id={`${id}-status`} className="w-full">
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
        </Field>
      )}
      <div className="flex flex-col gap-2">
        <Button variant="outline" onClick={onEdit}>
          <Pencil />
          {t("detail.edit")}
        </Button>
        {jdFile && (
          <a
            href={jdFile}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonLink({ variant: "outline" })}
          >
            <FileText />
            {t("detail.jdFile")}
          </a>
        )}
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 />
          {t("detail.delete")}
        </Button>
      </div>
    </aside>
  )
}
