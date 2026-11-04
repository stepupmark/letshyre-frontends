import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { useState } from "react"

import { INVITE_HREF, isWebAddress } from "../../lib/link"
import { LinkTarget } from "./link-target"

export function LinkDialog({
  initial,
  onSave,
  onRemove,
  onClose,
}: {
  initial: string | null
  onSave: (href: string) => void
  onRemove: () => void
  onClose: () => void
}) {
  const { t } = useTranslation(["invitations", "common"])
  const [href, setHref] = useState(initial ?? INVITE_HREF)
  const [error, setError] = useState<string>()

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (href !== INVITE_HREF && !isWebAddress(href)) {
              setError(t("link.urlError"))
              return
            }
            onSave(href)
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {initial ? t("link.editTitle") : t("link.addTitle")}
            </DialogTitle>
            <DialogDescription>{t("link.lead")}</DialogDescription>
          </DialogHeader>
          <LinkTarget
            href={href}
            error={error}
            onChange={(next) => {
              setHref(next)
              setError(undefined)
            }}
          />
          <DialogFooter>
            {initial && (
              <Button
                type="button"
                variant="ghost"
                className="me-auto text-destructive"
                onClick={onRemove}
              >
                {t("link.remove")}
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>
              {t("common:confirm.cancel")}
            </DialogClose>
            <Button type="submit">{t("link.apply")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
