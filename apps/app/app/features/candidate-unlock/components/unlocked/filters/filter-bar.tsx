import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"
import { ChevronDown } from "lucide-react"
import type { ReactNode } from "react"

import { FilterChips } from "@/components/filter-chips"

import { useFilterLabels } from "../../../hooks/use-filter-labels"
import { filterCount, hasExperience } from "../../../lib/filters"
import type { UnlockedFilters } from "../../../types"
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
  onChange: (change: Partial<UnlockedFilters>) => void
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
          onChange={(skills) => {
            onChange({ skills })
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

function FilterPopover({
  label,
  active,
  badge,
  children,
}: {
  label: string
  active: boolean
  badge: ReactNode
  children: ReactNode
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "group max-md:hidden",
              active && "border-brand/40 bg-brand-muted hover:bg-brand-muted"
            )}
          />
        }
      >
        {label}
        {badge}
        <ChevronDown className="text-muted-foreground transition-transform duration-200 group-data-popup-open:rotate-180 motion-reduce:transition-none" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 gap-0 p-4">
        {children}
      </PopoverContent>
    </Popover>
  )
}
