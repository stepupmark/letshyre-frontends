import { useTranslation } from "@workspace/i18n/react"
import { Sheet, SheetContent, SheetTitle } from "@workspace/ui/components/sheet"
import type { ReactNode } from "react"

import { nameOf } from "../lib/result"
import type { SearchResult } from "../schemas/candidate-search.schema"

export function PreviewSheet({
  row,
  open,
  onClose,
  children,
}: {
  row: SearchResult | undefined
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  const { t } = useTranslation("candidateSearch")
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <SheetContent
        side="bottom"
        className="max-h-[90svh] gap-0 overflow-y-auto rounded-t-xl p-0"
      >
        <SheetTitle className="sr-only">
          {row ? nameOf(row, t("card.unnamed")) : ""}
        </SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  )
}
