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

import type { UnlockedFilters } from "../../../types"
import { CountBadge } from "./count-badge"
import { ExperienceFields } from "./experience-fields"
import { SkillsFields } from "./skills-fields"

export function FilterSheet({
  filters,
  count,
  total,
  onChange,
  onClear,
}: {
  filters: UnlockedFilters
  count: number
  total: number | null
  onChange: (change: Partial<UnlockedFilters>) => void
  onClear: () => void
}) {
  const { t } = useTranslation("unlock")
  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="outline" className="h-11 md:hidden" />}
      >
        <SlidersHorizontal />
        {t("filters.title")}
        <CountBadge count={count} />
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90svh] gap-0 rounded-t-xl">
        <SheetHeader className="border-b">
          <SheetTitle className="text-brand-text">
            {t("filters.title")}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 overflow-y-auto p-4">
          <SkillsFields
            skills={filters.skills}
            onChange={(skills) => {
              onChange({ skills })
            }}
          />
          <ExperienceFields filters={filters} onChange={onChange} />
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
