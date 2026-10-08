import { Logo } from "@workspace/blocks/logo"
import { Link, NavLink, useLocation } from "react-router"
import { ChevronRight } from "lucide-react"
import { navigation, type NavItem } from "@/lib/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar"

function isActive(pathname: string, url: string, exact: boolean) {
  return exact
    ? pathname === url
    : pathname === url || pathname.startsWith(`${url}/`)
}

function NavEntry({ item }: { item: NavItem }) {
  const { pathname } = useLocation()

  if (!item.items?.length) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={item.title}
          isActive={isActive(pathname, item.url, item.url === "/dashboard")}
          render={<NavLink to={item.url} end={item.url === "/dashboard"} />}
        >
          <item.icon />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible
      defaultOpen={isActive(pathname, item.url, false)}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive(pathname, item.url, false)}
          />
        }
      >
        <item.icon />
        <span>{item.title}</span>
        <ChevronRight className="ms-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items.map((sub) => (
            <SidebarMenuSubItem key={sub.url}>
              <SidebarMenuSubButton
                isActive={pathname === sub.url}
                render={<NavLink to={sub.url} end />}
              >
                <span>{sub.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" role="navigation" aria-label="Main navigation">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link to="/dashboard" aria-label="LetsHyre dashboard" />}
            >
              <Logo label="" className="group-data-[collapsible=icon]:hidden" />
              <img
                src="/icon.png"
                alt=""
                className="hidden size-8 rounded-md group-data-[collapsible=icon]:block"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <NavEntry key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
