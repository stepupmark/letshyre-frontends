import { useTranslation } from "@workspace/i18n/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Kbd, KbdGroup } from "@workspace/ui/components/kbd"

export function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation("shell")
  const rows = [
    { keys: ["Ctrl", "K"], label: t("shortcuts.search") },
    { keys: ["Ctrl", "B"], label: t("shortcuts.sidebar") },
    { keys: ["?"], label: t("shortcuts.help") },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("shortcuts.title")}</DialogTitle>
        </DialogHeader>
        <dl className="flex flex-col gap-3 text-sm">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4"
            >
              <dt>{row.label}</dt>
              <dd>
                <KbdGroup>
                  {row.keys.map((key) => (
                    <Kbd key={key} className="text-foreground">
                      {key}
                    </Kbd>
                  ))}
                </KbdGroup>
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  )
}
