import { useState } from "react"
import { useNavigate } from "react-router"
import { useQuery } from "@tanstack/react-query"
import {
  Briefcase,
  CreditCard,
  Moon,
  Tag,
  User,
  type LucideIcon,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { navigation } from "@/lib/navigation"
import { candidatesQueries } from "@/features/candidates"
import { jobsQueries } from "@/features/jobs"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

interface Entry {
  label: string
  url: string
  icon: LucideIcon
  hint?: string
}

const PAGES: Entry[] = navigation.flatMap((group) =>
  group.items.flatMap((item) =>
    item.items
      ? item.items.map((child) => ({
          label: child.title,
          url: child.url,
          icon: item.icon,
          hint: item.title,
        }))
      : [{ label: item.title, url: item.url, icon: item.icon }]
  )
)

const CREATE: Entry[] = [
  { label: "New coupon", url: "/dashboard/coupons/new", icon: Tag },
  {
    label: "New payment gateway",
    url: "/dashboard/payment-gateways/new",
    icon: CreditCard,
  },
]

const THEME_ENTRY: Entry = {
  label: "Toggle dark mode",
  url: "",
  icon: Moon,
  hint: "theme",
}

const matches = (entry: Entry, query: string) =>
  `${entry.label} ${entry.hint ?? ""}`
    .toLowerCase()
    .includes(query.toLowerCase())

interface CommandPaletteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPaletteDialog({
  open,
  onOpenChange: setOpen,
}: CommandPaletteDialogProps) {
  const navigate = useNavigate()
  const { toggleTheme } = useTheme()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState("")
  const search = useDebouncedValue(query.trim())
  const searching = search.length >= 2

  const candidates = useQuery({
    ...candidatesQueries.list({ page: 1, search }),
    enabled: open && searching,
    placeholderData: undefined,
  })
  const jobs = useQuery({
    ...jobsQueries.list({ page: 1, search }),
    enabled: open && searching,
    placeholderData: undefined,
  })

  const go = (url: string) => {
    setOpen(false)
    void navigate(url)
  }

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setQuery("")
  }

  const pages = PAGES.filter((entry) => matches(entry, query))
  const create = CREATE.filter((entry) => matches(entry, query))
  const people = searching ? (candidates.data?.results ?? []).slice(0, 5) : []
  const jobResults = searching ? (jobs.data?.results ?? []).slice(0, 5) : []
  const loading = searching && (candidates.isFetching || jobs.isFetching)
  const showTheme = matches(THEME_ENTRY, query)

  // cmdk keeps a selection that no longer exists when results change, so fall back to the first item
  const values = [
    ...people.map((candidate) => `candidate-${candidate.id}`),
    ...jobResults.map((job) => `job-${job.id}`),
    ...pages.map((entry) => `page-${entry.url}`),
    ...create.map((entry) => `create-${entry.url}`),
    ...(showTheme ? ["toggle-theme"] : []),
  ]
  const active = values.includes(selected) ? selected : (values[0] ?? "")

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Jump to a page, candidate or job."
    >
      <Command shouldFilter={false} value={active} onValueChange={setSelected}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search pages, candidates and jobs…"
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Searching…" : "No results found."}
          </CommandEmpty>
          {people.length > 0 && (
            <CommandGroup heading="Candidates">
              {people.map((candidate) => (
                <CommandItem
                  key={candidate.id}
                  value={`candidate-${candidate.id}`}
                  onSelect={() => {
                    go(`/dashboard/candidates/${candidate.id}`)
                  }}
                >
                  <User />
                  <span className="truncate">
                    {candidate.name || "Unnamed"}
                  </span>
                  <span className="ms-auto truncate text-xs text-muted-foreground">
                    {candidate.email}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {jobResults.length > 0 && (
            <CommandGroup heading="Jobs">
              {jobResults.map((job) => (
                <CommandItem
                  key={job.id}
                  value={`job-${job.id}`}
                  onSelect={() => {
                    go(`/dashboard/jobs/${job.id}`)
                  }}
                >
                  <Briefcase />
                  <span className="truncate">
                    {job.title || "Untitled job"}
                  </span>
                  <span className="ms-auto truncate text-xs text-muted-foreground">
                    {job.company_name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {pages.length > 0 && (
            <CommandGroup heading="Pages">
              {pages.map((entry) => (
                <CommandItem
                  key={entry.url}
                  value={`page-${entry.url}`}
                  onSelect={() => {
                    go(entry.url)
                  }}
                >
                  <entry.icon />
                  {entry.label}
                  {entry.hint && (
                    <span className="ms-auto text-xs text-muted-foreground">
                      {entry.hint}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {(create.length > 0 || showTheme) && (
            <CommandGroup heading="Actions">
              {create.map((entry) => (
                <CommandItem
                  key={entry.url}
                  value={`create-${entry.url}`}
                  onSelect={() => {
                    go(entry.url)
                  }}
                >
                  <entry.icon />
                  {entry.label}
                </CommandItem>
              ))}
              {showTheme && (
                <CommandItem
                  value="toggle-theme"
                  onSelect={() => {
                    toggleTheme()
                    setOpen(false)
                  }}
                >
                  <Moon />
                  {THEME_ENTRY.label}
                </CommandItem>
              )}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
