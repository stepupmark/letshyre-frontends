import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { Kbd } from "@workspace/ui/components/kbd"
import { Spinner } from "@workspace/ui/components/spinner"
import { MapPin, Search } from "lucide-react"
import { useEffect, useRef } from "react"

import type { JobSearch } from "../types"

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

export function SearchBar({
  search,
  busy,
  onSearch,
}: {
  search: JobSearch
  busy: boolean
  onSearch: (change: Pick<JobSearch, "q" | "location">) => void
}) {
  const { t } = useTranslation("candidateJobs")
  const keyword = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey) return
      if (typing(event.target) || document.querySelector("[role=dialog]"))
        return
      event.preventDefault()
      keyword.current?.focus()
      keyword.current?.select()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  return (
    <form
      role="search"
      key={`${search.q}|${search.location}`}
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const read = (name: string) => {
          const value = data.get(name)
          return typeof value === "string" ? value.trim() : ""
        }
        onSearch({ q: read("q"), location: read("location") })
      }}
      className="flex flex-col gap-2 rounded-xl border bg-card p-2 sm:flex-row"
    >
      <InputGroup className="h-10 max-sm:h-11 sm:flex-2 sm:border-transparent sm:dark:bg-transparent">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          ref={keyword}
          name="q"
          type="search"
          aria-label={t("filters.keyword")}
          aria-keyshortcuts="/"
          placeholder={t("filters.keyword")}
          defaultValue={search.q}
          enterKeyHint="search"
        />
        <InputGroupAddon
          align="inline-end"
          aria-hidden="true"
          className="max-lg:hidden"
        >
          <Kbd>/</Kbd>
        </InputGroupAddon>
      </InputGroup>
      <span aria-hidden="true" className="my-2 w-px bg-border max-sm:hidden" />
      <InputGroup className="h-10 max-sm:h-11 sm:flex-1 sm:border-transparent sm:dark:bg-transparent">
        <InputGroupAddon>
          <MapPin />
        </InputGroupAddon>
        <InputGroupInput
          name="location"
          aria-label={t("filters.location")}
          placeholder={t("filters.location")}
          defaultValue={search.location}
          autoComplete="address-level2"
          enterKeyHint="search"
        />
      </InputGroup>
      <Button type="submit" className="h-10 px-5 max-sm:h-11">
        {busy ? <Spinner /> : <Search className="sm:hidden" />}
        {t("filters.search")}
      </Button>
    </form>
  )
}
