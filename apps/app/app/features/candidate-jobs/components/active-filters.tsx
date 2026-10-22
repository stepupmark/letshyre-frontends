import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { X } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"

import type { FilterChip } from "../hooks/use-filter-chips"
import type { JobSearch } from "../types"

export function ActiveFilters({
  chips,
  onChange,
  onClear,
}: {
  chips: FilterChip[]
  onChange: (change: Partial<JobSearch>) => void
  onClear?: () => void
}) {
  const { t } = useTranslation("candidateJobs")
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ul className="flex flex-wrap items-center gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {chips.map((chip) => (
            <m.li
              key={chip.key}
              layout="position"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.96,
                transition: { duration: duration.fast },
              }}
              transition={{ duration: duration.base, ease }}
            >
              <button
                type="button"
                aria-label={t("filters.remove", { filter: chip.label })}
                onClick={() => {
                  onChange(chip.remove)
                }}
                className="relative flex h-7 max-w-64 items-center gap-1 rounded-full border bg-background ps-3 pe-2 text-xs font-medium transition-colors outline-none after:absolute after:inset-x-0 after:-inset-y-2 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <bdi className="truncate">{chip.label}</bdi>
                <X
                  aria-hidden="true"
                  className="size-3.5 text-muted-foreground"
                />
              </button>
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
      {onClear && chips.length > 0 && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          {t("filters.clear")}
        </Button>
      )}
    </div>
  )
}
