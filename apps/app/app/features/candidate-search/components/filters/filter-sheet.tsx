import { useTranslation } from "@workspace/i18n/react"
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

import { DEGREES } from "../../lib/degrees"
import type { SearchChange, SearchFilters } from "../../types"
import { ExperienceFields } from "./experience-fields"
import { TextFilter } from "./text-filter"

export function FilterSheet({
  filters,
  count,
  total,
  onChange,
  onClear,
}: {
  filters: SearchFilters
  count: number
  total: number | null
  onChange: (change: SearchChange) => void
  onClear: () => void
}) {
  const { t } = useTranslation("candidateSearch")
  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="outline" className="h-11 md:hidden" />}
      >
        <SlidersHorizontal />
        {t("filters.title")}
        {count > 0 && (
          <>
            <span
              aria-hidden="true"
              className="grid size-5 place-items-center rounded-full bg-primary text-xs font-medium text-primary-foreground tabular-nums"
            >
              {count}
            </span>
            <span className="sr-only">{t("filters.applied", { count })}</span>
          </>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90svh] gap-0 rounded-t-xl">
        <SheetHeader className="border-b">
          <SheetTitle className="text-brand-text">
            {t("filters.title")}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 overflow-y-auto p-4">
          <ExperienceFields value={filters} onChange={onChange} />
          <TextFilter
            key={`education:${filters.education}`}
            label={t("filters.educationLabel")}
            placeholder={t("filters.educationPlaceholder")}
            picks={DEGREES}
            picksLabel={t("filters.commonDegrees")}
            value={filters.education}
            onApply={(education) => {
              onChange({ education })
            }}
          />
          <TextFilter
            key={`location:${filters.location}`}
            label={t("filters.locationLabel")}
            placeholder={t("filters.locationPlaceholder")}
            value={filters.location}
            onApply={(location) => {
              onChange({ location })
            }}
          />
        </div>
        <SheetFooter className="flex-row border-t">
          <Button
            variant="outline"
            className="h-11 flex-1"
            disabled={count === 0}
            onClick={onClear}
          >
            {t("filters.clear")}
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
