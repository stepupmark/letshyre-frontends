import { useTranslation } from "@workspace/i18n/react"
import { PencilLine, Search } from "lucide-react"
import { useEffect, useEffectEvent, useRef, useState } from "react"
import { flushSync } from "react-dom"

import type { JobSearch } from "../types"
import { SearchForm } from "./search-form"

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
  const [editing, setEditing] = useState(false)
  const collapsed = !editing && Boolean(search.q || search.location)

  const edit = () => {
    flushSync(() => {
      setEditing(true)
    })
    keyword.current?.focus()
    keyword.current?.select()
  }

  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey) return
    if (typing(event.target) || document.querySelector("[role=dialog]")) return
    event.preventDefault()
    edit()
  })

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      onKey(event)
    }
    document.addEventListener("keydown", listener)
    return () => {
      document.removeEventListener("keydown", listener)
    }
  }, [])

  return (
    <>
      {collapsed && (
        <button
          type="button"
          onClick={edit}
          className="flex h-11 min-w-0 items-center gap-2.5 rounded-xl border bg-card px-3 text-start text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:hidden"
        >
          <Search
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <span className="sr-only">{t("filters.editSearch")}: </span>
          <bdi className="min-w-0 flex-1 truncate font-medium">
            {[search.q, search.location].filter(Boolean).join(" · ")}
          </bdi>
          <PencilLine
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
        </button>
      )}
      <SearchForm
        key={`${search.q}|${search.location}`}
        search={search}
        busy={busy}
        keywordRef={keyword}
        className={collapsed ? "max-sm:hidden" : undefined}
        onSearch={(change) => {
          setEditing(false)
          onSearch(change)
        }}
      />
    </>
  )
}
