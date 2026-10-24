import { Logo, LogoMark } from "@workspace/blocks/logo"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
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
  SidebarSeparator,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import * as m from "motion/react-m"
import { X } from "lucide-react"
import { useLocation } from "react-router"

import { AppLink } from "@/components/app-link"
import { spring } from "@/lib/motion"

import { homeOf, isActive, NAV, type Area, type NavGroup } from "../lib/nav"
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
  const { isMobile, setOpenMobile } = useSidebar()
  const close = () => {
    setOpenMobile(false)
  }
  const groups: NavGroup[] = NAV[area]
  const primary = groups
    .flatMap((group) => group.items)
    .find((item) => item.primary)

  return (
    <Sidebar collapsible="icon" side={side}>
      <nav
        aria-label={t("navigation")}
        className="flex min-h-0 flex-1 flex-col"
      >
        <SidebarHeader className="h-14 flex-row items-center justify-between px-3 group-data-[collapsible=icon]:px-2">
          <AppLink
            to={homeOf(area)}
            onClick={close}
            className="flex items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Logo className="h-6 group-data-[collapsible=icon]:hidden" />
            <LogoMark className="hidden group-data-[collapsible=icon]:block" />
          </AppLink>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("closeMenu")}
              onClick={close}
            >
              <X />
            </Button>
          )}
        </SidebarHeader>
        <SidebarContent>
          {primary && (
            <SidebarGroup className="pb-0">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={t(`nav.${primary.key}`)}
                    aria-current={
                      isActive(primary, pathname) ? "page" : undefined
                    }
                    className="h-9 justify-center bg-primary font-medium text-primary-foreground transition-[background-color,scale] hover:bg-primary/90 hover:text-primary-foreground active:scale-98 active:bg-primary/90 active:text-primary-foreground motion-reduce:transition-none max-md:h-10"
                    render={<AppLink to={primary.to} onClick={close} />}
                  >
                    <primary.icon />
                    <span>{t(`nav.${primary.key}`)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          )}
          {groups.map((group, index) => (
            <SidebarGroup
              key={group.key}
              className="group-data-[collapsible=icon]:py-1 data-[last=true]:mt-auto"
              data-last={index > 0 && index === groups.length - 1}
            >
              {index > 0 && (
                <SidebarSeparator className="mb-2 hidden group-data-[collapsible=icon]:block" />
              )}
              <SidebarGroupLabel>{t(`groups.${group.key}`)}</SidebarGroupLabel>
              <SidebarMenu className="gap-0.5">
                {group.items
                  .filter((item) => !item.primary)
                  .map((item) => {
                    const active = isActive(item, pathname)
                    return (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton
                          tooltip={t(`nav.${item.key}`)}
                          isActive={active}
                          aria-current={active ? "page" : undefined}
                          className="relative isolate h-9 transition-colors hover:bg-sidebar-accent/70 max-md:h-10 data-active:bg-transparent data-active:text-primary data-active:hover:bg-transparent data-active:hover:text-primary [&_svg]:transition-transform [&_svg]:duration-150 hover:[&_svg]:scale-110 motion-reduce:[&_svg]:transition-none data-active:[&_svg]:text-primary"
                          render={<AppLink to={item.to} onClick={close} />}
                        >
                          {active && (
                            <m.span
                              layoutId={`nav-active-${area}`}
                              transition={spring}
                              aria-hidden="true"
                              className="absolute inset-0 -z-10 rounded-md border bg-background"
                            />
                          )}
                          <item.icon />
                          <span>{t(`nav.${item.key}`)}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </nav>
      <SidebarFooter>
        <UserMenu area={area} onOpenShortcuts={onOpenShortcuts} />
      </SidebarFooter>
      <SidebarRail aria-label={t("toggleSidebar")} title={t("toggleSidebar")} />
    </Sidebar>
  )
}
