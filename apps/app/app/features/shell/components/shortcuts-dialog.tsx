import { useTranslation } from "@workspace/i18n/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Kbd, KbdGroup } from "@workspace/ui/components/kbd"
import { CircleHelp, PanelLeft, Search, type LucideIcon } from "lucide-react"

import { modKey } from "../lib/keys"

export function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation("shell")
  const rows: { keys: string[]; label: string; icon: LucideIcon }[] = [
    { keys: [modKey, "K"], label: t("shortcuts.search"), icon: Search },
    { keys: [modKey, "B"], label: t("shortcuts.sidebar"), icon: PanelLeft },
    { keys: ["?"], label: t("shortcuts.help"), icon: CircleHelp },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("shortcuts.title")}</DialogTitle>
          <DialogDescription>{t("shortcuts.description")}</DialogDescription>
        </DialogHeader>
        <dl className="divide-y rounded-lg border">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-3 px-3 py-2.5"
            >
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4"
              >
                <row.icon />
              </span>
              <dt className="min-w-0 flex-1 text-sm">{row.label}</dt>
              <dd>
                <KbdGroup>
                  {row.keys.map((key) => (
                    <Kbd
                      key={key}
                      className="h-6 min-w-6 border bg-background px-1.5 text-foreground"
                    >
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
