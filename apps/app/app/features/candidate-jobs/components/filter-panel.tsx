import { dirFor } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { SlidersHorizontal } from "lucide-react"
import { useId, type ReactNode } from "react"

import type { JobSearch } from "../types"
import { FilterFields } from "./filter-fields"

interface PanelProps {
  search: JobSearch
  count: number
  onChange: (change: Partial<JobSearch>) => void
  onClear: () => void
  saved: ReactNode
}

export function FilterRail({
  search,
  count,
  onChange,
  onClear,
  saved,
}: PanelProps) {
  const { t } = useTranslation("candidateJobs")
  const id = useId()
  return (
    <aside
      aria-labelledby={id}
      className="hidden w-64 shrink-0 flex-col gap-4 lg:sticky lg:top-20 lg:flex lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto"
    >
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
        <div className="flex min-h-7 flex-wrap items-center justify-between gap-x-2">
          <h2
            id={id}
            className="flex items-center gap-2 text-base font-semibold tracking-tight whitespace-nowrap"
          >
            {t("filters.title")}
            {count > 0 && (
              <>
                <span
                  aria-hidden="true"
                  className="grid size-5 place-items-center rounded-full bg-primary text-xs font-medium text-primary-foreground tabular-nums"
                >
                  {count}
                </span>
                <span className="sr-only">
                  {t("filters.applied", { count })}
                </span>
              </>
            )}
          </h2>
          {count > 0 && (
            <Button variant="link" size="sm" className="px-0" onClick={onClear}>
              {t("filters.clearFilters")}
            </Button>
          )}
        </div>
        <FilterFields search={search} onChange={onChange} />
      </div>
      {saved && <div className="rounded-lg border bg-card p-4">{saved}</div>}
    </aside>
  )
}

export function FilterSheet({
  search,
  count,
  total,
  onChange,
  onClear,
  saved,
}: PanelProps & { total: number | null }) {
  const { t } = useTranslation("candidateJobs")
  const side = dirFor(useLocale()) === "rtl" ? "left" : "right"
  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="outline" className="max-sm:h-11 lg:hidden" />}
      >
        <SlidersHorizontal />
        {t("filters.title")}
        {count > 0 && (
          <>
            <span
              aria-hidden="true"
              className="grid size-5 place-items-center rounded-full bg-primary text-xs text-primary-foreground tabular-nums"
            >
              {count}
            </span>
            <span className="sr-only">{t("filters.applied", { count })}</span>
          </>
        )}
      </SheetTrigger>
      <SheetContent side={side} className="w-full gap-0 sm:max-w-sm">
        <SheetHeader className="border-b">
          <SheetTitle>{t("filters.title")}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
          <FilterFields search={search} onChange={onChange} />
          {saved}
        </div>
        <SheetFooter className="flex-row border-t">
          <Button
            variant="outline"
            className="h-11 flex-1"
            disabled={count === 0}
            onClick={onClear}
          >
            {t("filters.clearFilters")}
          </Button>
          <SheetClose render={<Button className="h-11 flex-1" />}>
            {total === null
              ? t("filters.done")
              : t("filters.doneCount", { count: total })}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
