import { dirFor } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { ChevronDown, ChevronUp } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useState, type KeyboardEvent, type ReactNode } from "react"

import { duration, ease } from "@/lib/motion"

const SLIDE = {
  enter: (x: number) => ({ opacity: 0, x }),
  center: { opacity: 1, x: 0 },
  leave: (x: number) => ({ opacity: 0, x: -x }),
}
const [ENTER, CENTER, LEAVE] = ["enter", "center", "leave"] as const

export function CandidateDialog({
  open,
  contentKey,
  position,
  onPrevious,
  onNext,
  onClose,
  returnFocus,
  children,
}: {
  open: boolean
  contentKey: string | undefined
  position: { current: number; total: number } | null
  onPrevious: (() => void) | null
  onNext: (() => void) | null
  onClose: () => void
  returnFocus: () => HTMLElement | null
  children: ReactNode
}) {
  const { t } = useTranslation("common")
  const rtl = dirFor(useLocale()) === "rtl"
  const [step, setStep] = useState(1)

  const go = (to: -1 | 1) => {
    const move = to === 1 ? onNext : onPrevious
    if (!move) return
    setStep(to)
    move()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (event.key === "j") go(1)
    if (event.key === "k") go(-1)
  }

  const shift = 8 * step * (rtl ? -1 : 1)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      onOpenChangeComplete={(next) => {
        if (!next) returnFocus()?.focus()
      }}
    >
      <DialogContent
        finalFocus={false}
        onKeyDown={onKeyDown}
        className="flex max-h-[90svh] flex-col gap-0 overflow-hidden p-0 max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none sm:max-w-2xl"
      >
        {position && (
          <div className="flex items-center gap-1 border-b py-2 ps-4 pe-12 text-xs text-muted-foreground">
            <span aria-live="polite" className="me-auto tabular-nums">
              {t("detail.position", position)}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("detail.previous")}
              disabled={!onPrevious}
              onClick={() => {
                go(-1)
              }}
            >
              <ChevronUp />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("detail.next")}
              disabled={!onNext}
              onClick={() => {
                go(1)
              }}
            >
              <ChevronDown />
            </Button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <AnimatePresence mode="popLayout" initial={false} custom={shift}>
            <m.div
              key={contentKey}
              custom={shift}
              variants={SLIDE}
              initial={ENTER}
              animate={CENTER}
              exit={LEAVE}
              transition={{ duration: duration.base, ease }}
            >
              {children}
            </m.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
