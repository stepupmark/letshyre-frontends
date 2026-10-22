import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

export function UnavailableDialog({
  failed,
  onClose,
}: {
  failed: boolean
  onClose: () => void
}) {
  const { t } = useTranslation("billing")
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {failed ? t("unavailable.failedTitle") : t("unavailable.title")}
          </DialogTitle>
          <DialogDescription>
            {failed ? t("unavailable.failedBody") : t("unavailable.body")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>{t("unavailable.close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
