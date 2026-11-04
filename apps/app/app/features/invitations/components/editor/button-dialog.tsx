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

import type { ButtonValues } from "../../lib/editor/commands"
import { BUTTON_TONES, toneOf, type ButtonTone } from "../../lib/email-styles"
import { INVITE_HREF, isWebAddress } from "../../lib/link"
import { LinkTarget } from "./link-target"

const LABEL_LIMIT = 60
const TONES: ButtonTone[] = ["primary", "dark"]

export function ButtonDialog({
  initial,
  onSave,
  onRemove,
  onClose,
}: {
  initial: ButtonValues | null
  onSave: (values: ButtonValues) => void
  onRemove: () => void
  onClose: () => void
}) {
  const { t } = useTranslation(["invitations", "common"])
  const [label, setLabel] = useState(initial?.label ?? t("button.defaultLabel"))
  const [href, setHref] = useState(initial?.href ?? INVITE_HREF)
  const [tone, setTone] = useState<ButtonTone>(
    initial ? toneOf(initial.style) : "primary"
  )
  const [errors, setErrors] = useState<{ label?: string; href?: string }>({})

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
            const next = {
              label: label.trim() ? undefined : t("button.labelError"),
              href:
                href === INVITE_HREF || isWebAddress(href)
                  ? undefined
                  : t("link.urlError"),
            }
            setErrors(next)
            if (next.label || next.href) return
            const keepStyle = initial && toneOf(initial.style) === tone
            onSave({
              label: label.trim(),
              href,
              style: keepStyle ? initial.style : BUTTON_TONES[tone],
            })
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {initial ? t("button.editTitle") : t("button.addTitle")}
            </DialogTitle>
            <DialogDescription>{t("button.lead")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5">
            <TextField
              label={t("button.label")}
              value={label}
              maxLength={LABEL_LIMIT}
              autoComplete="off"
              error={errors.label}
              onChange={(event) => {
                setLabel(event.target.value)
              }}
            />
            <LinkTarget
              href={href}
              error={errors.href}
              onChange={(next) => {
                setHref(next)
              }}
            />
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium">
                {t("button.style")}
              </legend>
              <div className="flex gap-3">
                {TONES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={tone === option}
                    onClick={() => {
                      setTone(option)
                    }}
                    className="flex flex-1 flex-col items-center gap-2 rounded-lg border p-3 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:border-brand aria-pressed:text-foreground"
                  >
                    <span
                      data-tone={option}
                      className="truncate rounded-md px-4 py-1.5 text-xs font-semibold data-[tone=dark]:bg-foreground data-[tone=dark]:text-background data-[tone=primary]:bg-primary data-[tone=primary]:text-primary-foreground"
                    >
                      {label.trim() || t("button.defaultLabel")}
                    </span>
                    {t(`button.tones.${option}`)}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <DialogFooter>
            {initial && (
              <Button
                type="button"
                variant="ghost"
                className="me-auto text-destructive"
                onClick={onRemove}
              >
                {t("button.remove")}
              </Button>
            )}
            <DialogClose render={<Button variant="outline" />}>
              {t("common:confirm.cancel")}
            </DialogClose>
            <Button type="submit">
              {initial ? t("button.apply") : t("button.insert")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
