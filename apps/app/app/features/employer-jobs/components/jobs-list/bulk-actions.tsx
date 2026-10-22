import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"

import { bulkTargets } from "../../lib/employer-jobs"
import { useBulkStatus } from "../../mutations/use-bulk-status"
import type { Job } from "../../schemas/employer-jobs.schema"

const LABEL = {
  open: "list.bulk.open",
  paused: "list.bulk.pause",
  closed: "list.bulk.close",
} as const

export function BulkActions({
  jobs,
  ids,
  clear,
}: {
  jobs: Job[]
  ids: string[]
  clear: () => void
}) {
  const { t } = useTranslation("jobs")
  const bulk = useBulkStatus()
  const { targets, movable, pending } = bulkTargets(jobs, ids)

  return (
    <>
      {pending > 0 && (
        <span className="text-xs text-muted-foreground">
          {t("list.pendingSkipped", { count: pending })}
        </span>
      )}
      {targets.map((status, i) => (
        <Button
          key={status}
          size="sm"
          variant={i === 0 ? "default" : "outline"}
          disabled={bulk.pending}
          onClick={() => {
            bulk.apply(movable, status, clear)
          }}
          className="animate-in fade-in-0 motion-reduce:animate-none"
        >
          {t(LABEL[status])}
        </Button>
      ))}
    </>
  )
}
