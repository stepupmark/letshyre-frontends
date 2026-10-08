import { useState } from "react"
import { useNavigate } from "react-router"
import { useQueries } from "@tanstack/react-query"
import { CreditCard, Moon, Tag, type LucideIcon } from "lucide-react"
import { useTheme } from "next-themes"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import { navigation } from "@/lib/navigation"
import type { SearchSource } from "@/lib/search"
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
  sources: SearchSource[]
}

export function CommandPaletteDialog({
  open,
  onOpenChange: setOpen,
  sources,
}: CommandPaletteDialogProps) {
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useTheme()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState("")
  const search = useDebouncedValue(query.trim())
  const searching = search.length >= 2

  const results = useQueries({
    queries: sources.map((source) => ({
      queryKey: ["search", source.heading, search],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        source.search(search, signal),
      enabled: open && searching,
    })),
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
  const groups = sources.map((source, index) => ({
    source,
    hits: searching ? (results[index]?.data ?? []) : [],
  }))
  const loading = searching && results.some((result) => result.isFetching)
  const showTheme = matches(THEME_ENTRY, query)

  // cmdk keeps a selection that no longer exists when results change, so fall back to the first item
  const values = [
    ...groups.flatMap(({ source, hits }) =>
      hits.map((hit) => `${source.heading}-${hit.id}`)
    ),
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
          {groups.map(
            ({ source, hits }) =>
              hits.length > 0 && (
                <CommandGroup key={source.heading} heading={source.heading}>
                  {hits.map((hit) => (
                    <CommandItem
                      className="data-selected:bg-brand-muted data-selected:text-brand-text data-selected:*:[svg]:text-brand-text"
                      key={hit.id}
                      value={`${source.heading}-${hit.id}`}
                      onSelect={() => {
                        go(hit.url)
                      }}
                    >
                      <source.icon />
                      <span className="truncate">{hit.label}</span>
                      <span className="ms-auto truncate text-xs text-muted-foreground">
                        {hit.detail}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
          )}
          {pages.length > 0 && (
            <CommandGroup heading="Pages">
              {pages.map((entry) => (
                <CommandItem
                  className="data-selected:bg-brand-muted data-selected:text-brand-text data-selected:*:[svg]:text-brand-text"
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
                  className="data-selected:bg-brand-muted data-selected:text-brand-text data-selected:*:[svg]:text-brand-text"
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
                  className="data-selected:bg-brand-muted data-selected:text-brand-text data-selected:*:[svg]:text-brand-text"
                  value="toggle-theme"
                  onSelect={() => {
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
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
