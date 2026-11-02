import { useTranslation } from "@workspace/i18n/react"
import { CircleCheck, Lock } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"

const FIELDS = ["contact", "scorecard", "recording", "resume"] as const

export function LockedFields({ unlocked }: { unlocked: boolean }) {
  const { t } = useTranslation("candidateSearch")

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {FIELDS.map((field, i) => (
        <li
          key={field}
          className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm"
        >
          <AnimatePresence mode="wait" initial={false}>
            {unlocked ? (
              <m.span
                key="open"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: duration.base, ease, delay: i * 0.05 }}
                className="flex shrink-0"
              >
                <CircleCheck
                  aria-hidden="true"
                  className="size-4 text-success"
                />
              </m.span>
            ) : (
              <m.span
                key="shut"
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: duration.fast }}
                className="flex shrink-0"
              >
                <Lock
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
              </m.span>
            )}
          </AnimatePresence>
          <span className="me-auto">{t(`dialog.locked.${field}`)}</span>
          <AnimatePresence initial={false}>
            {!unlocked && (
              <m.span
                aria-hidden="true"
                exit={{ opacity: 0, scaleX: 0.4 }}
                transition={{ duration: duration.base, ease, delay: i * 0.05 }}
                className="h-2 w-16 shrink-0 origin-right rounded-full bg-muted rtl:origin-left"
              />
            )}
          </AnimatePresence>
        </li>
      ))}
    </ul>
  )
}
