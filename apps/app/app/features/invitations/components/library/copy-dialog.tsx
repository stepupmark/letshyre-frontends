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

import { TextField } from "@/components/text-field"

import { copyName } from "../../lib/copy-name"
import { useCopyTemplate } from "../../mutations/use-copy-template"
import type { Template } from "../../schemas/template.schema"

const MAX_NAME = 120

export function CopyDialog({
  source,
  taken,
  onClose,
  onCopied,
}: {
  source: Template
  taken: string[]
  onClose: () => void
  onCopied?: (template: Template) => void
}) {
  const { t } = useTranslation(["invitations", "common"])
  const [name, setName] = useState(() =>
    copyName(source.name, taken, t("copy.suffix"))
  )
  const [error, setError] = useState<string>()
  const copy = useCopyTemplate({
    onCopied: (template) => {
      onClose()
      onCopied?.(template)
    },
  })

  const submit = () => {
    const value = name.trim()
    if (!value || value.length > MAX_NAME) {
      setError(t("copy.nameError", { max: MAX_NAME }))
      return
    }
    copy.mutate({ source, name: value })
  }

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
            submit()
          }}
        >
          <DialogHeader>
            <DialogTitle>{t("copy.title")}</DialogTitle>
            <DialogDescription>
              {t("copy.lead", { name: source.name })}
            </DialogDescription>
          </DialogHeader>
          <TextField
            label={t("copy.name")}
            value={name}
            autoComplete="off"
            maxLength={MAX_NAME + 20}
            error={error}
            onChange={(event) => {
              setName(event.target.value)
              setError(undefined)
            }}
            onFocus={(event) => {
              event.target.select()
            }}
          />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("common:confirm.cancel")}
            </DialogClose>
            <Button type="submit" disabled={copy.isPending}>
              {copy.isPending ? t("copy.copying") : t("copy.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
