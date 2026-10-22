import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import { Slider } from "@workspace/ui/components/slider"
import { Switch } from "@workspace/ui/components/switch"
import { useId, useState } from "react"

import { EMPLOYMENT_TYPES, MAX_EXPERIENCE, PAY_STEPS } from "../lib/search"
import type { JobSearch } from "../types"
import { Group, Option } from "./filter-group"
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
  return (
    <Group title={t("filters.type")}>
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
  const pick = (value: number | readonly number[]) =>
    typeof value === "number" ? value : (value[0] ?? 0)

  return (
    <Group
      id={titleId}
      title={t("filters.experienceTitle")}
      aside={
        <span className="text-sm font-medium tabular-nums">
          {years === null
            ? t("filters.experienceAny")
            : t("facts.years", { years })}
        </span>
      }
    >
      <div className="flex flex-col gap-2 pt-1">
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
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>{t("facts.years", { years: 0 })}</span>
          {search.experience !== null && (
            <Button
              variant="link"
              size="xs"
              className="h-auto p-0 text-xs"
              onClick={() => {
                onChange({ experience: null })
              }}
            >
              {t("filters.experienceAny")}
            </Button>
          )}
          <span>{t("facts.years", { years: MAX_EXPERIENCE })}</span>
        </div>
      </div>
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
      label: t("filters.salaryStep", { amount }),
    })),
  ]
  return (
    <Group title={t("filters.salaryTitle")}>
      <RadioGroup
        value={search.pay === null ? ANY : String(search.pay)}
        onValueChange={(value) => {
          onChange({ pay: value === ANY ? null : Number(value) })
        }}
        className="gap-0"
      >
        {steps.map((step) => (
          <Option key={step.value}>
            <RadioGroupItem value={step.value} />
            <span className="tabular-nums" dir="ltr">
              {step.label}
            </span>
          </Option>
        ))}
      </RadioGroup>
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
      <label className="flex min-h-8 cursor-pointer items-center justify-between gap-3 text-sm font-medium max-lg:min-h-11">
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
