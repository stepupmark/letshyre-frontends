import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import * as m from "motion/react-m"
import { useId, useState } from "react"

import { spring } from "@/lib/motion"

import { useFilterLabels } from "../../hooks/use-filter-labels"
import { EXPERIENCE_PRESETS, MAX_YEARS } from "../../lib/params"
import type { SearchFilters } from "../../types"

type Range = Pick<SearchFilters, "min" | "max">

const OPTIONS: Range[] = [{ min: null, max: null }, ...EXPERIENCE_PRESETS]

const toYears = (text: string) =>
  text === ""
    ? null
    : Math.min(MAX_YEARS, Math.max(0, Math.floor(Number(text))))

export function ExperienceFields({
  value,
  onChange,
}: {
  value: Range
  onChange: (range: Range) => void
}) {
  const { t } = useTranslation("candidateSearch")
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
            const on = option.min === value.min && option.max === value.max
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
        key={`${String(value.min)}-${String(value.max)}`}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

function CustomRange({
  value,
  onChange,
}: {
  value: Range
  onChange: (range: Range) => void
}) {
  const { t } = useTranslation("candidateSearch")
  const id = useId()
  const [min, setMin] = useState(value.min?.toString() ?? "")
  const [max, setMax] = useState(value.max?.toString() ?? "")
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
        <YearsInput
          label={t("filters.min")}
          value={min}
          error={invalid ? `${id}-error` : undefined}
          onChange={setMin}
        />
        <YearsInput
          label={t("filters.max")}
          value={max}
          error={invalid ? `${id}-error` : undefined}
          onChange={setMax}
        />
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

function YearsInput({
  label,
  value,
  error,
  onChange,
}: {
  label: string
  value: string
  error: string | undefined
  onChange: (value: string) => void
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        max={MAX_YEARS}
        step={1}
        value={value}
        aria-invalid={error !== undefined}
        aria-describedby={error}
        className="tabular-nums max-md:h-11"
        onChange={(event) => {
          onChange(event.target.value)
        }}
      />
    </div>
  )
}
