import { logout, PUBLIC_HOME } from "@workspace/auth"
import { useSession } from "@workspace/auth/react"
import { LOCALE_NAMES } from "@workspace/i18n"
import { useTranslation } from "@workspace/i18n/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import {
  ChevronsUpDown,
  Keyboard,
  Languages,
  Lightbulb,
  LogOut,
  UserRound,
} from "lucide-react"

import { api } from "@/lib/api"
import { APP_LOCALES, changeLocale, locale } from "@/lib/i18n"
import { useGo } from "@/lib/navigation"

import type { Area } from "./nav"
import { restartTips } from "./tips"

const text = (value: unknown) =>
  typeof value === "string" && value ? value : undefined

export function UserMenu({
  area,
  onOpenShortcuts,
}: {
  area: Area
  onOpenShortcuts: () => void
}) {
  const { t } = useTranslation("shell")
  const session = useSession()
  const go = useGo()
  if (session.status !== "signed-in") return null

  const { user } = session
  const email = text(user.email)
  const name =
    text(user.name) ??
    text(
      [text(user.first_name), text(user.last_name)].filter(Boolean).join(" ")
    ) ??
    email ??
    ""
  const initials = name
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
  const profile =
    area === "employer" ? "/employer/profile" : "/employee/profile"

  const signOut = async () => {
    await logout(api)
    window.location.assign(PUBLIC_HOME)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" aria-label={t("user.menu")} />}
          >
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium"
            >
              {initials}
            </span>
            <span className="grid min-w-0 flex-1 text-start leading-tight">
              <span className="truncate text-sm font-medium">{name}</span>
              {email && email !== name && (
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
              )}
            </span>
            <ChevronsUpDown className="ms-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-60">
            {email && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="truncate">
                  {email}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                go(profile)
              }}
            >
              <UserRound />
              {t("user.profile")}
            </DropdownMenuItem>
            {APP_LOCALES.length > 1 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Languages />
                  {t("user.language")}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={locale}
                    onValueChange={(value) => {
                      const next = APP_LOCALES.find((l) => l === value)
                      if (next && next !== locale) changeLocale(next)
                    }}
                  >
                    {APP_LOCALES.map((l) => (
                      <DropdownMenuRadioItem key={l} value={l} lang={l}>
                        {LOCALE_NAMES[l]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            <DropdownMenuItem onClick={onOpenShortcuts}>
              <Keyboard />
              {t("user.shortcuts")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={restartTips}>
              <Lightbulb />
              {t("user.tips")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void signOut()}>
              <LogOut />
              {t("user.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
