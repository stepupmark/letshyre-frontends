import { logout, PUBLIC_HOME } from "@workspace/auth"
import { clearAll as clearAssistantChats } from "@workspace/blocks/assistant-store"
import { useSession } from "@workspace/auth/react"
import { LOCALE_ENGLISH_NAMES, LOCALE_NAMES } from "@workspace/i18n"
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
import { useState } from "react"
import { href } from "react-router"

import { api } from "@/lib/api"
import { APP_LOCALES, changeLocale, locale } from "@/lib/i18n"
import { useGo } from "@/lib/navigation"
import { displayName, initials } from "@/lib/user-name"

import type { Area } from "../lib/nav"
import { restartTips } from "../lib/tips"

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
  const [leaving, setLeaving] = useState(false)
  if (session.status !== "signed-in") return null

  const { user } = session
  const email = typeof user.email === "string" ? user.email : undefined
  const name = displayName(user)
  const languages = [locale, ...APP_LOCALES.filter((l) => l !== locale)]
  const profile =
    area === "employer" ? href("/employer/company") : href("/employee/profile")

  const signOut = async () => {
    setLeaving(true)
    clearAssistantChats()
    try {
      await logout(api)
    } finally {
      window.location.assign(PUBLIC_HOME)
    }
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
              className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary"
            >
              {initials(name)}
            </span>
            <span className="grid min-w-0 flex-1 text-start">
              <span className="truncate text-sm font-medium">{name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {t(`user.role.${area}`)}
              </span>
            </span>
            <ChevronsUpDown className="ms-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-60">
            {email && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="truncate">
                    {email}
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
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
                  <span
                    lang={locale}
                    className="ms-auto truncate text-xs text-muted-foreground"
                  >
                    {LOCALE_NAMES[locale]}
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-80 w-56 overflow-y-auto overscroll-contain">
                  <DropdownMenuRadioGroup
                    value={locale}
                    onValueChange={(value) => {
                      const next = APP_LOCALES.find((l) => l === value)
                      if (next && next !== locale) changeLocale(next)
                    }}
                  >
                    {languages.map((l) => (
                      <DropdownMenuRadioItem key={l} value={l}>
                        <span className="flex min-w-0 flex-col">
                          <span lang={l} className="truncate font-medium">
                            {LOCALE_NAMES[l]}
                          </span>
                          {l !== "en" && (
                            <span className="truncate text-xs text-muted-foreground">
                              {LOCALE_ENGLISH_NAMES[l]}
                            </span>
                          )}
                        </span>
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
            <DropdownMenuItem
              closeOnClick={false}
              disabled={leaving}
              onClick={() => void signOut()}
            >
              <LogOut />
              {leaving ? t("user.signingOut") : t("user.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
