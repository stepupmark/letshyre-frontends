import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { Kbd } from "@workspace/ui/components/kbd"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"
import { History, MapPin, Search, X } from "lucide-react"
import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react"

import { loadRecent, rememberSearch, type RecentSearch } from "../lib/search"
import type { JobSearch } from "../types"

const labelOf = (entry: RecentSearch) =>
  [entry.q, entry.location].filter(Boolean).join(" · ")

export function SearchForm({
  search,
  busy,
  keywordRef,
  className,
  onSearch,
}: {
  search: JobSearch
  busy: boolean
  keywordRef: RefObject<HTMLInputElement | null>
  className?: string
  onSearch: (change: RecentSearch) => void
}) {
  const { t } = useTranslation("candidateJobs")
  const [q, setQ] = useState(search.q)
  const [location, setLocation] = useState(search.location)
  const [recent, setRecent] = useState(loadRecent)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const cityRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const showRecent = open && !q && recent.length > 0

  const submit = (entry: RecentSearch) => {
    const clean = { q: entry.q.trim(), location: entry.location.trim() }
    setRecent(rememberSearch(clean))
    setOpen(false)
    onSearch(clean)
  }

  const onKeywordKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showRecent) return
    const last = recent.length - 1
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActive(active >= last ? 0 : active + 1)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive(active <= 0 ? last : active - 1)
    } else if (event.key === "Enter" && recent[active]) {
      event.preventDefault()
      submit(recent[active])
    } else if (event.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        submit({ q, location })
      }}
      className={cn(
        "flex flex-col gap-2 rounded-xl border bg-card p-2 sm:flex-row",
        className
      )}
    >
      <div className="relative sm:flex-2">
        <InputGroup className="h-10 max-sm:h-11 sm:border-transparent sm:focus-within:bg-muted/50 sm:dark:bg-transparent">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            ref={keywordRef}
            name="q"
            role="combobox"
            aria-label={t("filters.keyword")}
            aria-keyshortcuts="/"
            aria-autocomplete="list"
            aria-expanded={showRecent}
            aria-controls={listId}
            aria-activedescendant={
              showRecent && active >= 0
                ? `${listId}-${String(active)}`
                : undefined
            }
            placeholder={t("filters.keyword")}
            value={q}
            autoComplete="off"
            enterKeyHint="search"
            onChange={(event) => {
              setQ(event.target.value)
              setActive(-1)
            }}
            onFocus={() => {
              setOpen(true)
            }}
            onBlur={() => {
              setOpen(false)
              setActive(-1)
            }}
            onKeyDown={onKeywordKey}
          />
          <InputGroupAddon align="inline-end">
            {q ? (
              <InputGroupButton
                size="icon-xs"
                aria-label={t("filters.clearField", {
                  field: t("filters.keyword"),
                })}
                onClick={() => {
                  setQ("")
                  keywordRef.current?.focus()
                }}
              >
                <X />
              </InputGroupButton>
            ) : (
              <Kbd
                aria-hidden="true"
                className="group-focus-within/input-group:hidden max-lg:hidden"
              >
                /
              </Kbd>
            )}
          </InputGroupAddon>
        </InputGroup>

        {showRecent && (
          <RecentList
            id={listId}
            recent={recent}
            active={active}
            onActive={setActive}
            onPick={submit}
          />
        )}
      </div>

      <span aria-hidden="true" className="my-2 w-px bg-border max-sm:hidden" />

      <InputGroup className="h-10 max-sm:h-11 sm:flex-1 sm:border-transparent sm:focus-within:bg-muted/50 sm:dark:bg-transparent">
        <InputGroupAddon>
          <MapPin />
        </InputGroupAddon>
        <InputGroupInput
          ref={cityRef}
          name="location"
          aria-label={t("filters.location")}
          placeholder={t("filters.location")}
          value={location}
          onChange={(event) => {
            setLocation(event.target.value)
          }}
          autoComplete="address-level2"
          enterKeyHint="search"
        />
        {location && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label={t("filters.clearField", {
                field: t("filters.location"),
              })}
              onClick={() => {
                setLocation("")
                cityRef.current?.focus()
              }}
            >
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>

      <Button type="submit" className="h-10 px-5 max-sm:h-11">
        {busy ? <Spinner /> : <Search className="sm:hidden" />}
        {t("filters.search")}
      </Button>
    </form>
  )
}

function RecentList({
  id,
  recent,
  active,
  onActive,
  onPick,
}: {
  id: string
  recent: RecentSearch[]
  active: number
  onActive: (index: number) => void
  onPick: (entry: RecentSearch) => void
}) {
  const { t } = useTranslation("candidateJobs")
  const titleId = useId()
  return (
    <div className="absolute inset-x-0 top-full z-20 mt-2 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
      <p id={titleId} className="px-2 py-1.5 text-xs text-muted-foreground">
        {t("filters.recent")}
      </p>
      <div id={id} role="listbox" aria-labelledby={titleId}>
        {recent.map((entry, i) => (
          <div
            key={labelOf(entry)}
            id={`${id}-${String(i)}`}
            role="option"
            aria-selected={i === active}
            tabIndex={-1}
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            onMouseEnter={() => {
              onActive(i)
            }}
            onClick={() => {
              onPick(entry)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") onPick(entry)
            }}
            className={cn(
              "flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 text-sm max-sm:min-h-11",
              i === active && "bg-muted"
            )}
          >
            <History
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            <bdi className="truncate">{labelOf(entry)}</bdi>
          </div>
        ))}
      </div>
    </div>
  )
}
