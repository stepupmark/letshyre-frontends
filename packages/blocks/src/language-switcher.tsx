import {
  CheckIcon,
  ChevronDownIcon,
  LanguagesIcon,
  SearchIcon,
} from "lucide-react"
import { type KeyboardEvent, useRef, useState } from "react"

import {
  LOCALE_ENGLISH_NAMES,
  LOCALE_NAMES,
  type Locale,
} from "@workspace/i18n"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

const SEARCH_FROM = 8
const ARROWS: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 }

interface LanguageSwitcherProps {
  current: Locale
  /** Only locales the current page is ready in. */
  locales: readonly Locale[]
  /** Read before the current language by screen readers, e.g. "Change language". */
  label: string
  searchLabel: string
  emptyLabel: string
  hrefFor: (locale: Locale) => string
  /** Runs before navigating, e.g. to remember the choice in `lh_locale`. */
  onSelect?: (locale: Locale) => void
  /** `code` shows "EN" instead of the full name, for tight headers. */
  display?: "name" | "code"
  side?: "top" | "bottom"
  className?: string
}

const matches = (locale: Locale, query: string) =>
  [locale, LOCALE_NAMES[locale], LOCALE_ENGLISH_NAMES[locale]].some((name) =>
    name.toLocaleLowerCase().includes(query)
  )

export function LanguageSwitcher({
  current,
  locales,
  label,
  searchLabel,
  emptyLabel,
  hrefFor,
  onSelect,
  display = "name",
  side = "bottom",
  className,
}: LanguageSwitcherProps) {
  const [query, setQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const searchable = locales.length > SEARCH_FROM
  const needle = query.trim().toLocaleLowerCase()
  const ordered = [current, ...locales.filter((l) => l !== current)]
  const shown = needle ? ordered.filter((l) => matches(l, needle)) : ordered
  const englishName =
    current === "en" ? "" : ` (${LOCALE_ENGLISH_NAMES[current]})`

  const moveFocus = (event: KeyboardEvent<HTMLElement>) => {
    const step = ARROWS[event.key]
    if (!step) return
    event.preventDefault()
    const links = [...event.currentTarget.querySelectorAll("a")]
    const at = links.indexOf(document.activeElement as HTMLAnchorElement)
    links[Math.max(0, at + step)]?.focus()
  }

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) setQuery("")
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            className={cn("gap-1.5 px-2.5 font-normal", className)}
          />
        }
        aria-label={`${label}: ${LOCALE_NAMES[current]}${englishName}`}
      >
        <LanguagesIcon aria-hidden />
        <span lang={current}>
          {display === "code" ? current.toUpperCase() : LOCALE_NAMES[current]}
        </span>
        <ChevronDownIcon aria-hidden className="size-3.5 opacity-60" />
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align="end"
        aria-label={label}
        // touch keeps the phone keyboard from popping up
        initialFocus={(type) => type === "touch" || (searchRef.current ?? true)}
        onKeyDown={moveFocus}
        className="w-64 gap-0 p-0"
      >
        {searchable && (
          <div className="relative border-b">
            <SearchIcon
              aria-hidden
              className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
              }}
              aria-label={searchLabel}
              placeholder={searchLabel}
              className="h-10 w-full bg-transparent ps-9 pe-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        )}
        <ul className="max-h-80 overflow-y-auto overscroll-contain p-1">
          {shown.map((locale) => (
            <li key={locale}>
              <a
                href={hrefFor(locale)}
                hrefLang={locale}
                aria-current={locale === current ? "true" : undefined}
                onClick={() => onSelect?.(locale)}
                className="flex items-center gap-3 rounded-md px-2.5 py-2 outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <span className="flex min-w-0 flex-1 flex-col text-start">
                  <span lang={locale} className="truncate font-medium">
                    {LOCALE_NAMES[locale]}
                  </span>
                  {locale !== "en" && (
                    <span className="truncate text-xs text-muted-foreground">
                      {LOCALE_ENGLISH_NAMES[locale]}
                    </span>
                  )}
                </span>
                {locale === current && (
                  <CheckIcon aria-hidden className="size-4 text-primary" />
                )}
              </a>
            </li>
          ))}
        </ul>
        {!shown.length && (
          <p
            role="status"
            className="px-3 py-6 text-center text-sm text-muted-foreground"
          >
            {emptyLabel}
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}
