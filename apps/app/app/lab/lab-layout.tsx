import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Button } from "@workspace/ui/components/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@workspace/ui/components/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Kbd } from "@workspace/ui/components/kbd"
import { Separator } from "@workspace/ui/components/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import {
  BriefcaseBusiness,
  ChevronsUpDown,
  Coins,
  CreditCard,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Search,
  UserRoundCheck,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import { Fragment, useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router"
import { toast } from "sonner"

import { AnimatedNumber } from "@/components/animated-number"

import type { Lang } from "./copy"
import { applicants, jobs } from "./fixtures"
import { LabProvider } from "./lab-context"
import { useLab, type ViewState } from "./use-lab"

interface NavItem {
  label: string
  icon: LucideIcon
  to?: string
  badge?: number
}

export default function LabLayout() {
  return (
    <LabProvider>
      <Shell />
    </LabProvider>
  )
}

function Shell() {
  const { t, lang, credits, view } = useLab()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  const notInLab = () => toast("That screen isn't in the lab yet.")

  const hiring: NavItem[] = [
    { label: t("nav.dashboard"), icon: LayoutDashboard, to: "/_lab/dashboard" },
    {
      label: t("nav.jobs"),
      icon: BriefcaseBusiness,
      to: "/_lab/applicants",
      badge: 16,
    },
    { label: t("nav.pool"), icon: Users },
    { label: t("nav.unlocked"), icon: UserRoundCheck },
  ]
  const company: NavItem[] = [
    { label: t("nav.team"), icon: UsersRound },
    { label: t("nav.billing"), icon: CreditCard },
  ]

  const go = (to: string) => {
    setPaletteOpen(false)
    void navigate(to, { viewTransition: true })
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon" side={lang === "ar" ? "right" : "left"}>
          <SidebarHeader>
            <Link
              to="/_lab"
              className="flex h-8 items-center gap-2 rounded-md px-2 text-base font-semibold tracking-tight group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs text-primary-foreground">
                L
              </span>
              <span className="group-data-[collapsible=icon]:hidden">
                LetsHyre
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            {[
              { label: t("nav.hiring"), items: hiring },
              { label: t("nav.company"), items: company },
            ].map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={item.to !== undefined && pathname === item.to}
                        render={
                          item.to ? (
                            <NavLink to={item.to} viewTransition />
                          ) : undefined
                        }
                        onClick={item.to ? undefined : notInLab}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge !== undefined && (
                        <SidebarMenuBadge className="tabular-nums">
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium">
                      PS
                    </span>
                    <span className="grid flex-1 text-start leading-tight">
                      <span className="truncate text-sm font-medium">
                        Priya Sharma
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        Orbit Labs
                      </span>
                    </span>
                    <ChevronsUpDown className="ms-auto size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="start"
                    className="w-56"
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>priya@orbitlabs.in</DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={notInLab}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setPaletteOpen(true)
                      }}
                    >
                      Search and shortcuts
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={notInLab}>
                      <LogOut />
                      {t("user.signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <LabControls />
          <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
            <SidebarTrigger className="-ms-1" />
            <Separator
              orientation="vertical"
              className="me-1 data-vertical:h-4 data-vertical:self-center"
            />
            <Crumbs />
            <div className="ms-auto flex items-center gap-2">
              <Button
                variant="outline"
                className="w-9 justify-center px-0 text-muted-foreground md:w-60 md:justify-start md:px-3"
                onClick={() => {
                  setPaletteOpen(true)
                }}
              >
                <Search />
                <span className="hidden truncate md:inline">
                  {t("nav.search")}
                </span>
                <Kbd className="ms-auto hidden text-foreground md:inline-flex">
                  Ctrl K
                </Kbd>
              </Button>
              <Button
                variant="ghost"
                className="gap-1.5"
                onClick={notInLab}
                aria-label={`${credits} credits`}
              >
                <Coins />
                <AnimatedNumber value={view === "empty" ? 10 : credits} />
              </Button>
            </div>
          </header>
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:p-8 2xl:max-w-7xl">
            <Outlet />
          </div>
        </SidebarInset>

        <CommandDialog
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          title={t("nav.search")}
          description="Jump to a page, candidate or job"
        >
          <Command>
            <CommandInput placeholder={t("nav.search")} />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup heading="Go to">
                <CommandItem
                  onSelect={() => {
                    go("/_lab/dashboard")
                  }}
                >
                  <LayoutDashboard />
                  {t("nav.dashboard")}
                  <CommandShortcut>G D</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    go("/_lab/applicants")
                  }}
                >
                  <BriefcaseBusiness />
                  {t("nav.jobs")}
                  <CommandShortcut>G J</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    go("/_lab/scorecard")
                  }}
                >
                  <FlaskConical />
                  {t("scorecard.title")}
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Candidates">
                {applicants.map((a) => (
                  <CommandItem
                    key={a.id}
                    value={`${a.name} ${a.role_applied}`}
                    onSelect={() => {
                      go(`/_lab/applicants?candidate=${a.id}`)
                    }}
                  >
                    {a.name}
                    <span className="truncate text-muted-foreground">
                      {a.role_applied}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Jobs">
                {jobs.map((job) => (
                  <CommandItem
                    key={job.id}
                    onSelect={() => {
                      go("/_lab/applicants")
                    }}
                  >
                    {job.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </SidebarProvider>
    </TooltipProvider>
  )
}

function Crumbs() {
  const { pathname } = useLocation()
  const { t } = useLab()
  const trail: { label: string; to?: string }[] =
    pathname === "/_lab/applicants"
      ? [
          { label: t("nav.jobs"), to: "/_lab/applicants" },
          { label: "Senior React Developer" },
        ]
      : pathname === "/_lab/scorecard"
        ? [{ label: t("nav.unlocked") }, { label: "Prathyusha" }]
        : pathname === "/_lab/dashboard"
          ? [{ label: t("nav.dashboard") }]
          : [{ label: "Design lab" }]

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        {trail.map((crumb, i) =>
          i < trail.length - 1 ? (
            <Fragment key={crumb.label}>
              <BreadcrumbItem className="hidden md:inline-flex">
                {crumb.to ? (
                  <BreadcrumbLink render={<Link to={crumb.to} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                ) : (
                  crumb.label
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </Fragment>
          ) : (
            <BreadcrumbItem key={crumb.label} className="min-w-0">
              <BreadcrumbPage className="truncate">
                {crumb.label}
              </BreadcrumbPage>
            </BreadcrumbItem>
          )
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function LabControls() {
  const { lang, setLang, view, setView } = useLab()

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-dashed bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
      <span className="font-medium">Prototype</span>
      <ToggleGroup
        size="sm"
        variant="outline"
        spacing={0}
        value={[lang]}
        onValueChange={(next: string[]) => {
          if (next[0]) setLang(next[0] as Lang)
        }}
        aria-label="Language"
      >
        <ToggleGroupItem value="en">EN</ToggleGroupItem>
        <ToggleGroupItem value="de">DE</ToggleGroupItem>
        <ToggleGroupItem value="ar">AR</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        size="sm"
        variant="outline"
        spacing={0}
        value={[view]}
        onValueChange={(next: string[]) => {
          if (next[0]) setView(next[0] as ViewState)
        }}
        aria-label="Data state"
      >
        <ToggleGroupItem value="ready">Data</ToggleGroupItem>
        <ToggleGroupItem value="loading">Loading</ToggleGroupItem>
        <ToggleGroupItem value="empty">New account</ToggleGroupItem>
        <ToggleGroupItem value="error">Error</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
