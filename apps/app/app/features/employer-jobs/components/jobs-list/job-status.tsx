import { useTranslation } from "@workspace/i18n/react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"

import { StatusBadge } from "@/components/status-badge"
import { duration, ease } from "@/lib/motion"

import { statusTone } from "../../lib/format"
import type { JobStatus } from "../../types"

export function Blank() {
  return <span className="text-muted-foreground">—</span>
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const { t } = useTranslation("jobs")
  return (
    <span className="inline-grid">
      <AnimatePresence initial={false} mode="popLayout">
        <m.span
          key={status}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: duration.fast, ease }}
        >
          <StatusBadge tone={statusTone[status]}>
            {t(`status.${status}`)}
          </StatusBadge>
        </m.span>
      </AnimatePresence>
    </span>
  )
}
