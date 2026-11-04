import { useTranslation } from "@workspace/i18n/react"
import { Check } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"

export function SaveState({
  dirty,
  saved,
}: {
  dirty: boolean
  saved: boolean
}) {
  const { t } = useTranslation("invitations")
  const state = dirty ? "dirty" : saved ? "saved" : null
  return (
    <span
      aria-live="polite"
      className="relative hidden text-sm text-muted-foreground sm:grid"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {state && (
          <m.span
            key={state}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: duration.fast, ease }}
            className="flex items-center gap-1.5"
          >
            {state === "dirty" ? (
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-warning"
              />
            ) : (
              <Check aria-hidden="true" className="size-4 text-success" />
            )}
            {state === "dirty" ? t("editor.unsaved") : t("editor.saved")}
          </m.span>
        )}
      </AnimatePresence>
    </span>
  )
}
