import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, type ReactNode } from "react"

import type { Match } from "../schemas/job-matches.schema"
import { MatchAvatar } from "./match-person"
import { MatchPeek } from "./match-peek"

export function MatchDialog({
  match,
  open,
  onClose,
  position,
  onPrevious,
  onNext,
  actions,
}: {
  match: Match | undefined
  open: boolean
  onClose: () => void
  position?: { current: number; total: number }
  onPrevious?: () => void
  onNext?: () => void
  actions: (match: Match) => ReactNode
}) {
  const { t } = useTranslation(["matches", "common"])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === "j") onNext?.()
      if (event.key === "k") onPrevious?.()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onNext, onPrevious])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className="flex max-h-[min(85dvh,44rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="flex-row items-center gap-3 border-b bg-brand-muted/40 p-4 pe-12 text-start">
          {match && <MatchAvatar match={match} />}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <DialogTitle className="truncate text-lg font-semibold">
              {match?.candidate_name ?? t("unnamed")}
            </DialogTitle>
            {match?.ai_match?.role_applied && (
              <DialogDescription className="truncate">
                {match.ai_match.role_applied}
              </DialogDescription>
            )}
          </div>
          {position && (
            <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={t("common:detail.previous")}
                disabled={!onPrevious}
                onClick={onPrevious}
              >
                <ChevronLeft className="rtl:-scale-x-100" />
              </Button>
              <span className="min-w-12 text-center tabular-nums">
                {t("common:detail.position", position)}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={t("common:detail.next")}
                disabled={!onNext}
                onClick={onNext}
              >
                <ChevronRight className="rtl:-scale-x-100" />
              </Button>
            </div>
          )}
        </DialogHeader>
        <div className="overflow-y-auto">
          {match && <MatchPeek match={match} actions={actions} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
