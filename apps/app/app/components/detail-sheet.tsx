import { dirFor } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useEffect, type ReactNode } from "react"

/** Side panel over a list, with previous/next through the list (also j/k). */
export function DetailSheet({
  open,
  onClose,
  title,
  description,
  position,
  onPrevious,
  onNext,
  footer,
  children,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  position?: { current: number; total: number }
  onPrevious?: () => void
  onNext?: () => void
  footer?: ReactNode
  children: ReactNode
}) {
  const { t } = useTranslation("common")
  const side = dirFor(useLocale()) === "rtl" ? "left" : "right"

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
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <SheetContent side={side} className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          {position && (
            <div className="flex items-center gap-1 pe-8 text-xs text-muted-foreground">
              <span className="me-auto tabular-nums">
                {t("detail.position", position)}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("detail.previous")}
                disabled={!onPrevious}
                onClick={onPrevious}
              >
                <ChevronUp />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("detail.next")}
                disabled={!onNext}
                onClick={onNext}
              >
                <ChevronDown />
              </Button>
            </div>
          )}
          <SheetTitle className="text-lg">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 text-sm">
          {children}
        </div>
        {footer && (
          <SheetFooter className="flex-row border-t">{footer}</SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
