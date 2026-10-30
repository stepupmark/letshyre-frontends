import { useTranslation } from "@workspace/i18n/react"
import { useState } from "react"

import { FilterChips } from "@/components/filter-chips"
import { FilterPopover } from "@/components/filter-popover"

import { useFilterLabels } from "../../hooks/use-filter-labels"
import { DEGREES } from "../../lib/degrees"
import { filterCount, hasExperience } from "../../lib/params"
import type { SearchChange, SearchFilters } from "../../types"
import { ExperienceFields } from "./experience-fields"
import { FilterSheet } from "./filter-sheet"
import { TextFilter } from "./text-filter"

type Open = "experience" | "education" | "location" | null

export function FilterBar({
  filters,
  total,
  onChange,
  onClear,
}: {
  filters: SearchFilters
  total: number | null
  onChange: (change: SearchChange) => void
  onClear: () => void
}) {
  const { t } = useTranslation("candidateSearch")
  const labels = useFilterLabels()
  const chips = labels.chips(filters)
  const [open, setOpen] = useState<Open>(null)
  const toggle = (name: Exclude<Open, null>) => (next: boolean) => {
    setOpen(next ? name : null)
  }
  const apply = (change: SearchChange) => {
    onChange(change)
    setOpen(null)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSheet
        filters={filters}
        count={filterCount(filters)}
        total={total}
        onChange={onChange}
        onClear={onClear}
      />
      <FilterPopover
        label={t("filters.experience")}
        active={hasExperience(filters)}
        open={open === "experience"}
        onOpenChange={toggle("experience")}
        badge={
          hasExperience(filters) && (
            <span className="text-brand-text tabular-nums">
              {labels.experience(filters)}
            </span>
          )
        }
      >
        <ExperienceFields value={filters} onChange={onChange} />
      </FilterPopover>
      <FilterPopover
        label={t("filters.education")}
        active={filters.education !== ""}
        open={open === "education"}
        onOpenChange={toggle("education")}
      >
        <TextFilter
          key={filters.education}
          label={t("filters.educationLabel")}
          placeholder={t("filters.educationPlaceholder")}
          picks={DEGREES}
          picksLabel={t("filters.commonDegrees")}
          value={filters.education}
          onApply={(education) => {
            apply({ education })
          }}
        />
      </FilterPopover>
      <FilterPopover
        label={t("filters.location")}
        active={filters.location !== ""}
        open={open === "location"}
        onOpenChange={toggle("location")}
      >
        <TextFilter
          key={filters.location}
          label={t("filters.locationLabel")}
          placeholder={t("filters.locationPlaceholder")}
          value={filters.location}
          onApply={(location) => {
            apply({ location })
          }}
        />
      </FilterPopover>
      {chips.length > 0 && (
        <FilterChips
          chips={chips}
          onRemove={(chip) => {
            onChange(chip.change)
          }}
          onClear={onClear}
        />
      )}
    </div>
  )
}
