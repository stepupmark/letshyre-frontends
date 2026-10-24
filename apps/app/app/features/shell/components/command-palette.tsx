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
import { Coins, Keyboard, LogOut } from "lucide-react"
import { href, useNavigate } from "react-router"

import { isAppPath } from "@/lib/app-paths"

import { useSignOut } from "../hooks/use-sign-out"
import { NAV, type Area, type NavGroup } from "../lib/nav"

export function CommandPalette({
  area,
  open,
  onOpenChange,
  onOpenShortcuts,
}: {
  area: Area
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenShortcuts: () => void
}) {
  const { t } = useTranslation("shell")
  const navigate = useNavigate()
  const { leaving, signOut } = useSignOut()
  const groups: NavGroup[] = NAV[area]
  const primary = groups
    .flatMap((group) => group.items)
    .filter((item) => item.primary)

  // shadcn renders the dialog title even when closed, outside any landmark
  if (!open) return null

  const go = (to: string) => {
    onOpenChange(false)
    if (isAppPath(to)) void navigate(to, { viewTransition: true })
    else window.location.assign(to)
  }

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
          {groups.map((group) => (
            <CommandGroup key={group.key} heading={t(`groups.${group.key}`)}>
              {group.items
                .filter((item) => !item.primary)
                .map((item) => (
                  <CommandItem
                    key={item.key}
                    value={t(`nav.${item.key}`)}
                    keywords={t(`search.keywords.${item.key}`).split(" ")}
                    onSelect={() => {
                      go(item.to)
                    }}
                  >
                    <item.icon />
                    {t(`nav.${item.key}`)}
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
          <CommandGroup heading={t("search.actions")}>
            {primary.map((item) => (
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
            ))}
            {area === "employer" && (
              <CommandItem
                value={t("search.buyCredits")}
                onSelect={() => {
                  go(href("/employer/billing"))
                }}
              >
                <Coins />
                {t("search.buyCredits")}
              </CommandItem>
            )}
            <CommandItem
              value={t("user.shortcuts")}
              onSelect={() => {
                onOpenChange(false)
                onOpenShortcuts()
              }}
            >
              <Keyboard />
              {t("user.shortcuts")}
            </CommandItem>
            <CommandItem
              value={t("user.signOut")}
              disabled={leaving}
              onSelect={() => void signOut()}
            >
              <LogOut />
              {leaving ? t("user.signingOut") : t("user.signOut")}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
