import { useTranslation } from "@workspace/i18n/react"
import { toast } from "sonner"

import { undoToast } from "@/lib/undo-toast"

import { ownStatus } from "../lib/employer-jobs"
import type { Job } from "../schemas/employer-jobs.schema"
import type { JobStatus } from "../types"
import { useSetJobsStatus } from "./use-job-changes"

export function useBulkStatus() {
  const { t } = useTranslation(["jobs", "common"])
  const change = useSetJobsStatus()

  const apply = (jobs: Job[], status: JobStatus, onDone: () => void) => {
    const before = new Map(jobs.map((job) => [job.id, ownStatus(job)] as const))
    change.mutate(
      jobs.map((job) => ({ id: job.id, status })),
      {
        onSuccess: (done) => {
          onDone()
          const failed = jobs.length - done.length
          if (failed) toast.error(t("list.changeFailed", { count: failed }))
          if (!done.length) return
          undoToast(
            t("list.changed", {
              count: done.length,
              status: t(`statusWord.${status}`),
            }),
            t("common:undo"),
            () => {
              change.mutate(
                done.map((id) => ({ id, status: before.get(id) ?? "open" })),
                {
                  onSuccess: (undone) => {
                    if (undone.length === done.length) toast(t("list.undone"))
                    else toast.error(t("list.undoFailed"))
                  },
                  onError: () => {
                    toast.error(t("list.undoFailed"))
                  },
                }
              )
            }
          )
        },
      }
    )
  }

  return { apply, pending: change.isPending }
}
