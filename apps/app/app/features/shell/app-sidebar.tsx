import { Logo } from "@workspace/blocks/logo"
import { useTranslation } from "@workspace/i18n/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { useLocation } from "react-router"

import { AppLink } from "@/components/app-link"

import { isActive, NAV, type Area } from "./nav"
import { UserMenu } from "./user-menu"

export function AppSidebar({
  area,
  side,
  onOpenShortcuts,
}: {
  area: Area
  side: "left" | "right"
  onOpenShortcuts: () => void
}) {
  const { t } = useTranslation("shell")
  const { pathname } = useLocation()
  const home = NAV[area][0]?.items[0]?.to ?? "/"

  return (
    <Sidebar
      collapsible="icon"
      side={side}
      role="navigation"
      aria-label={t("navigation")}
    >
      <SidebarHeader>
        <AppLink
          to={home}
          className="flex h-8 items-center rounded-md px-2 group-data-[collapsible=icon]:hidden"
        >
          <Logo className="h-5" />
        </AppLink>
      </SidebarHeader>
      <SidebarContent>
        {NAV[area].map((group) => (
          <SidebarGroup key={group.key}>
            <SidebarGroupLabel>{t(`groups.${group.key}`)}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    tooltip={t(`nav.${item.key}`)}
                    isActive={isActive(item, pathname)}
                    render={<AppLink to={item.to} />}
                  >
                    <item.icon />
                    <span>{t(`nav.${item.key}`)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <UserMenu area={area} onOpenShortcuts={onOpenShortcuts} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
