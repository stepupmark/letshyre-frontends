import { Link, NavLink, useLocation } from "react-router";
import { ChevronRight } from "lucide-react";
import { navigation, type NavItem } from "~/config/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
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
} from "~/components/ui/sidebar";

function isActive(pathname: string, url: string, exact: boolean) {
  return exact
    ? pathname === url
    : pathname === url || pathname.startsWith(`${url}/`);
}

function NavEntry({ item }: { item: NavItem }) {
  const { pathname } = useLocation();

  if (!item.items?.length) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          isActive={isActive(pathname, item.url, item.url === "/dashboard")}
        >
          <NavLink to={item.url} end={item.url === "/dashboard"}>
            <item.icon />
            <span>{item.title}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      asChild
      defaultOpen={isActive(pathname, item.url, false)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive(pathname, item.url, false)}
          >
            <item.icon />
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((sub) => (
              <SidebarMenuSubItem key={sub.url}>
                <SidebarMenuSubButton asChild isActive={pathname === sub.url}>
                  <NavLink to={sub.url} end>
                    <span>{sub.title}</span>
                  </NavLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard" aria-label="LetsHyre dashboard">
                {/* collapsed, only the "L" of the wordmark is shown */}
                <span className="overflow-hidden group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-2.5">
                  <img
                    src="/letshyre.png"
                    alt=""
                    className="h-6 w-auto max-w-none"
                  />
                </span>
              </Link>
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
  );
}
