import { useTranslation } from "@workspace/i18n/react"

import { FilterChips } from "@/components/filter-chips"
import { FilterPopover } from "@/components/filter-popover"

import { useFilterLabels } from "../../../hooks/use-filter-labels"
import { filterCount, hasExperience } from "../../../lib/filters"
import type { FilterChange, UnlockedFilters } from "../../../types"
import { CountBadge } from "./count-badge"
import { ExperienceFields } from "./experience-fields"
import { FilterSheet } from "./filter-sheet"
import { SkillsFields } from "./skills-fields"

export function FilterBar({
  filters,
  total,
  onChange,
  onClear,
}: {
  filters: UnlockedFilters
  total: number | null
  onChange: (change: FilterChange) => void
  onClear: () => void
}) {
  const { t } = useTranslation("unlock")
  const labels = useFilterLabels()
  const chips = labels.chips(filters)

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
        label={t("filters.skills")}
        active={filters.skills.length > 0}
        badge={<CountBadge count={filters.skills.length} />}
      >
        <SkillsFields
          skills={filters.skills}
          onChange={(edit) => {
            onChange((current) => ({ skills: edit(current.skills) }))
          }}
        />
      </FilterPopover>
      <FilterPopover
        label={t("filters.experience")}
        active={hasExperience(filters)}
        badge={
          hasExperience(filters) && (
            <span className="text-brand-text tabular-nums">
              {labels.experience(filters)}
            </span>
          )
        }
      >
        <ExperienceFields filters={filters} onChange={onChange} />
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
