import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"

import { industriesQuery } from "@/lib/industries"

import type { JobSearch } from "../types"

export interface FilterChip {
  key: string
  label: string
  remove: Partial<JobSearch>
}

export function useFilterChips() {
  const { t } = useTranslation("candidateJobs")
  const industries = useQuery(industriesQuery())
  const industryLabel = (value: string) =>
    industries.data?.find((item) => item.value === value)?.label ?? value

  const chipsOf = (search: JobSearch): FilterChip[] => {
    const chips: FilterChip[] = [
      ...search.types.map((type) => ({
        key: `type:${type}`,
        label: t(`types.${type}`),
        remove: { types: search.types.filter((other) => other !== type) },
      })),
      ...search.industries.map((industry) => ({
        key: `industry:${industry}`,
        label: industryLabel(industry),
        remove: {
          industries: search.industries.filter((other) => other !== industry),
        },
      })),
    ]
    if (search.experience !== null)
      chips.push({
        key: "experience",
        label: t("facts.years", { years: search.experience }),
        remove: { experience: null },
      })
    if (search.pay !== null)
      chips.push({
        key: "pay",
        label: t("filters.salaryStep", { amount: search.pay }),
        remove: { pay: null },
      })
    if (search.hideApplied)
      chips.push({
        key: "hide",
        label: t("filters.hideApplied"),
        remove: { hideApplied: false },
      })
    return chips
  }

  const describe = (search: JobSearch) =>
    [search.q, search.location, ...chipsOf(search).map((chip) => chip.label)]
      .filter(Boolean)
      .join(" · ")

  return { chipsOf, describe }
}
