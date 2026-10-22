import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Slider } from "@workspace/ui/components/slider"
import { Switch } from "@workspace/ui/components/switch"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import { cn } from "@workspace/ui/lib/utils"
import { useId, useState } from "react"

import { EMPLOYMENT_TYPES, MAX_EXPERIENCE, PAY_STEPS } from "../lib/search"
import type { JobSearch } from "../types"
import { Group, Option, ResetButton } from "./filter-group"
import { IndustryFilter } from "./industry-filter"

type Change = (change: Partial<JobSearch>) => void

const ANY = "any"

const toggle = <T,>(list: T[], item: T, on: boolean) =>
  on ? [...list, item] : list.filter((other) => other !== item)

export function FilterFields({
  search,
  onChange,
}: {
  search: JobSearch
  onChange: Change
}) {
  return (
    <div className="flex flex-col divide-y">
      <TypeFilter search={search} onChange={onChange} />
      <ExperienceFilter search={search} onChange={onChange} />
      <SalaryFilter search={search} onChange={onChange} />
      <IndustryFilter search={search} onChange={onChange} />
      <AppliedFilter search={search} onChange={onChange} />
    </div>
  )
}

function TypeFilter({
  search,
  onChange,
}: {
  search: JobSearch
  onChange: Change
}) {
  const { t } = useTranslation("candidateJobs")
  const locale = useLocale()
  const picked = search.types.map((type) => t(`types.${type}`))
  return (
    <Group
      title={t("filters.type")}
      summary={
        picked.length > 0
          ? new Intl.ListFormat(locale, { style: "narrow" }).format(picked)
          : null
      }
    >
      <ul>
        {EMPLOYMENT_TYPES.map((type) => (
          <li key={type}>
            <Option>
              <Checkbox
                checked={search.types.includes(type)}
                onCheckedChange={(checked) => {
                  onChange({ types: toggle(search.types, type, checked) })
                }}
              />
              {t(`types.${type}`)}
            </Option>
          </li>
        ))}
      </ul>
    </Group>
  )
}

function ExperienceFilter({
  search,
  onChange,
}: {
  search: JobSearch
  onChange: Change
}) {
  const { t } = useTranslation("candidateJobs")
  const titleId = useId()
  const [dragging, setDragging] = useState<number | null>(null)
  const years = dragging ?? search.experience
  const unset = years === null
  const pick = (value: number | readonly number[]) =>
    typeof value === "number" ? value : (value[0] ?? 0)
  const label =
    years === null
      ? t("filters.experienceAny")
      : years === 0
        ? t("filters.fresher")
        : t("facts.years", { years })

  return (
    <Group
      id={titleId}
      title={t("filters.experienceTitle")}
      summary={search.experience === null ? null : label}
      aside={
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium tabular-nums",
              unset && "text-muted-foreground"
            )}
          >
            {label}
          </span>
          {search.experience !== null && (
            <ResetButton
              onClick={() => {
                onChange({ experience: null })
              }}
            />
          )}
        </span>
      }
    >
      <Slider
        aria-labelledby={titleId}
        min={0}
        max={MAX_EXPERIENCE}
        step={1}
        value={[years ?? 0]}
        onValueChange={(value) => {
          setDragging(pick(value))
        }}
        onValueCommitted={(value) => {
          setDragging(null)
          onChange({ experience: pick(value) })
        }}
        className={cn(
          "py-3 **:data-[slot=slider-thumb]:size-5 **:data-[slot=slider-thumb]:border-2 **:data-[slot=slider-thumb]:border-primary **:data-[slot=slider-thumb]:bg-background **:data-[slot=slider-track]:h-1.5 **:data-[slot=slider-track]:bg-border",
          unset &&
            "**:data-[slot=slider-range]:opacity-0 **:data-[slot=slider-thumb]:border-muted-foreground"
        )}
      />
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{t("filters.fresher")}</span>
        <span>{t("facts.years", { years: `${String(MAX_EXPERIENCE)}+` })}</span>
      </div>
      <p className="text-xs text-pretty text-muted-foreground">
        {unset ? t("filters.experienceHintAny") : t("filters.experienceHint")}
      </p>
    </Group>
  )
}

function SalaryFilter({
  search,
  onChange,
}: {
  search: JobSearch
  onChange: Change
}) {
  const { t } = useTranslation("candidateJobs")
  const steps = [
    { value: ANY, label: t("filters.salaryAny") },
    ...PAY_STEPS.map((amount) => ({
      value: String(amount),
      label: t("filters.salaryChip", { amount }),
    })),
  ]
  return (
    <Group
      title={t("filters.salaryTitle")}
      summary={
        search.pay === null
          ? null
          : t("filters.salaryStep", { amount: search.pay })
      }
      aside={
        search.pay === null ? (
          <span className="text-xs text-muted-foreground">
            {t("filters.salaryUnit")}
          </span>
        ) : (
          <ResetButton
            onClick={() => {
              onChange({ pay: null })
            }}
          />
        )
      }
    >
      <ToggleGroup
        variant="outline"
        spacing={1.5}
        value={[search.pay === null ? ANY : String(search.pay)]}
        onValueChange={(value) => {
          const next = value[0]
          onChange({
            pay: next === undefined || next === ANY ? null : Number(next),
          })
        }}
        className="grid w-full grid-cols-3"
      >
        {steps.map((step) => (
          <ToggleGroupItem
            key={step.value}
            value={step.value}
            dir="ltr"
            className="h-9 w-full tabular-nums aria-pressed:border-primary aria-pressed:bg-primary/5 aria-pressed:text-foreground max-lg:h-11"
          >
            {step.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-xs text-pretty text-muted-foreground">
        {t("filters.salaryHint")}
      </p>
    </Group>
  )
}

function AppliedFilter({
  search,
  onChange,
}: {
  search: JobSearch
  onChange: Change
}) {
  const { t } = useTranslation("candidateJobs")
  return (
    <div className="py-4 last:pb-0">
      <label className="flex min-h-9 cursor-pointer items-center justify-between gap-3 text-sm font-medium max-lg:min-h-11">
        {t("filters.hideApplied")}
        <Switch
          checked={search.hideApplied}
          onCheckedChange={(checked) => {
            onChange({ hideApplied: checked })
          }}
        />
      </label>
    </div>
  )
}
