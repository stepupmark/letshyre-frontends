import { dirFor } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

import { EmailPreview } from "./email-preview"

export function PreviewSheet({
  open,
  onClose,
  templateId,
  subject,
  body,
}: {
  open: boolean
  onClose: () => void
  templateId: string
  subject: string
  body: string
}) {
  const { t } = useTranslation("invitations")
  const side = dirFor(useLocale()) === "rtl" ? "left" : "right"
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <SheetContent
        side={side}
        className="w-full gap-0 data-[side=left]:sm:max-w-2xl data-[side=right]:sm:max-w-2xl"
      >
        <SheetHeader className="border-b">
          <SheetTitle>{t("preview.title")}</SheetTitle>
          <SheetDescription>{t("preview.sheetLead")}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {open && (
            <EmailPreview
              templateId={templateId}
              subject={subject}
              body={body}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
