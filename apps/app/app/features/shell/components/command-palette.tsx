import { useTranslation } from "@workspace/i18n/react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import { useNavigate } from "react-router"

import { isAppPath } from "@/lib/app-paths"

import { NAV, type Area } from "../lib/nav"

/** Ctrl K / ⌘K: jumps to any page in the current area. */
export function CommandPalette({
  area,
  open,
  onOpenChange,
}: {
  area: Area
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation("shell")
  const navigate = useNavigate()

  const go = (to: string) => {
    onOpenChange(false)
    if (isAppPath(to)) void navigate(to, { viewTransition: true })
    else window.location.assign(to)
  }

  // shadcn renders the dialog title even when closed, outside any landmark
  if (!open) return null

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("search.title")}
      description={t("search.description")}
    >
      <Command>
        <CommandInput placeholder={t("search.button")} />
        <CommandList>
          <CommandEmpty>{t("search.empty")}</CommandEmpty>
          <CommandGroup heading={t("search.pages")}>
            {NAV[area].flatMap((group) =>
              group.items.map((item) => (
                <CommandItem
                  key={item.key}
                  value={t(`nav.${item.key}`)}
                  onSelect={() => {
                    go(item.to)
                  }}
                >
                  <item.icon />
                  {t(`nav.${item.key}`)}
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
