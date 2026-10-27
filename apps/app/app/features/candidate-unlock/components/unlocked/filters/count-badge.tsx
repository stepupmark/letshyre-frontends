import { useTranslation } from "@workspace/i18n/react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"

export function CountBadge({ count }: { count: number }) {
  const { t } = useTranslation("unlock")
  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <m.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: duration.base, ease }}
          className="inline-flex"
        >
          <span
            aria-hidden="true"
            className="grid size-5 place-items-center rounded-full bg-primary text-xs font-medium text-primary-foreground tabular-nums"
          >
            {count}
          </span>
          <span className="sr-only">{t("filters.applied", { count })}</span>
        </m.span>
      )}
    </AnimatePresence>
  )
}
