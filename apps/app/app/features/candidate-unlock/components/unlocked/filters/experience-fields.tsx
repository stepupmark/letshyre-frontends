import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import * as m from "motion/react-m"
import { useId, useState } from "react"

import { spring } from "@/lib/motion"

import { useFilterLabels } from "../../../hooks/use-filter-labels"
import { EXPERIENCE_PRESETS, MAX_YEARS } from "../../../lib/filters"
import type { UnlockedFilters } from "../../../types"

type Range = Pick<UnlockedFilters, "min" | "max">

const OPTIONS: Range[] = [{ min: null, max: null }, ...EXPERIENCE_PRESETS]

export function ExperienceFields({
  filters,
  onChange,
}: {
  filters: UnlockedFilters
  onChange: (change: Range) => void
}) {
  const { t } = useTranslation("unlock")
  const labels = useFilterLabels()
  const id = useId()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p id={id} className="text-sm font-medium">
          {t("filters.experienceLabel")}
        </p>
        <div
          role="group"
          aria-labelledby={id}
          className="grid grid-cols-5 gap-1 rounded-lg bg-muted p-1"
        >
          {OPTIONS.map((option) => {
            const on = option.min === filters.min && option.max === filters.max
            return (
              <button
                key={`${String(option.min)}-${String(option.max)}`}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  onChange(option)
                }}
                className="relative h-8 rounded-md px-1 text-xs font-medium text-muted-foreground tabular-nums transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:text-brand-text max-md:h-11"
              >
                {on && (
                  <m.span
                    layoutId={`${id}-preset`}
                    transition={spring}
                    className="absolute inset-0 rounded-md border bg-background"
                  />
                )}
                <span className="relative">{labels.preset(option)}</span>
              </button>
            )
          })}
        </div>
      </div>
      <CustomRange
        key={`${String(filters.min)}-${String(filters.max)}`}
        filters={filters}
        onChange={onChange}
      />
    </div>
  )
}

const toYears = (text: string) =>
  text === ""
    ? null
    : Math.min(MAX_YEARS, Math.max(0, Math.floor(Number(text))))

function CustomRange({
  filters,
  onChange,
}: {
  filters: UnlockedFilters
  onChange: (change: Range) => void
}) {
  const { t } = useTranslation("unlock")
  const id = useId()
  const [min, setMin] = useState(filters.min?.toString() ?? "")
  const [max, setMax] = useState(filters.max?.toString() ?? "")
  const low = toYears(min)
  const high = toYears(max)
  const invalid = low !== null && high !== null && low > high

  return (
    <form
      noValidate
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!invalid) onChange({ min: low === 0 ? null : low, max: high })
      }}
    >
      <p className="text-sm font-medium">{t("filters.custom")}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor={`${id}-min`}
            className="text-xs text-muted-foreground"
          >
            {t("filters.min")}
          </Label>
          <Input
            id={`${id}-min`}
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_YEARS}
            step={1}
            value={min}
            aria-invalid={invalid}
            aria-describedby={invalid ? `${id}-error` : undefined}
            className="tabular-nums max-md:h-11"
            onChange={(event) => {
              setMin(event.target.value)
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor={`${id}-max`}
            className="text-xs text-muted-foreground"
          >
            {t("filters.max")}
          </Label>
          <Input
            id={`${id}-max`}
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_YEARS}
            step={1}
            value={max}
            aria-invalid={invalid}
            aria-describedby={invalid ? `${id}-error` : undefined}
            className="tabular-nums max-md:h-11"
            onChange={(event) => {
              setMax(event.target.value)
            }}
          />
        </div>
      </div>
      {invalid && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {t("filters.minOverMax")}
        </p>
      )}
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={invalid}
        className="self-end max-md:h-11"
      >
        {t("filters.apply")}
      </Button>
    </form>
  )
}
