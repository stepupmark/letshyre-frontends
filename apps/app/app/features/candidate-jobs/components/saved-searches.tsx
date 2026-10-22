import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { History, X } from "lucide-react"
import { useId } from "react"

import { useFilterChips } from "../hooks/use-filter-chips"
import { readSearch } from "../lib/search"

export function SavedSearches({
  saved,
  active,
  onPick,
  onRemove,
}: {
  saved: string[]
  active: string
  onPick: (key: string) => void
  onRemove: (key: string) => void
}) {
  const { t } = useTranslation("candidateJobs")
  const { describe } = useFilterChips()
  const id = useId()
  if (saved.length === 0) return null
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h3 id={id} className="text-sm font-semibold">
        {t("saved.title")}
      </h3>
      <ul className="flex flex-col">
        {saved.map((item) => {
          const label = describe(readSearch(new URLSearchParams(item)))
          return (
            <li
              key={item}
              className={cn(
                "group/saved flex items-center gap-1 rounded-md text-sm hover:bg-muted",
                item === active && "bg-muted"
              )}
            >
              <button
                type="button"
                aria-pressed={item === active}
                onClick={() => {
                  onPick(item)
                }}
                className="flex min-h-8 min-w-0 flex-1 items-center gap-2 rounded-md ps-2 text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50 max-lg:min-h-11"
              >
                <History
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground"
                />
                <bdi className="truncate">{label}</bdi>
              </button>
              <button
                type="button"
                aria-label={t("saved.remove", { search: label })}
                onClick={() => {
                  onRemove(item)
                }}
                className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 max-lg:size-11"
              >
                <X className="size-3.5" />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
