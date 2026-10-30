import { useTranslation } from "@workspace/i18n/react"

import { hasExperience } from "../lib/params"
import type { SearchFilters } from "../types"

type Range = Pick<SearchFilters, "min" | "max">

export function useFilterLabels() {
  const { t } = useTranslation("candidateSearch")

  const experience = ({ min, max }: Range) =>
    max === null
      ? t("filters.minYears", { min })
      : min === null
        ? t("filters.upTo", { max })
        : t("filters.range", { min, max })

  const preset = ({ min, max }: Range) =>
    min === null && max === null
      ? t("filters.any")
      : max === null
        ? t("filters.minShort", { min })
        : t("filters.rangeShort", { min: min ?? 0, max })

  const chips = (filters: SearchFilters) => [
    ...(hasExperience(filters)
      ? [
          {
            key: "experience",
            label: experience(filters),
            change: { min: null, max: null },
          },
        ]
      : []),
    ...(filters.education
      ? [
          {
            key: "education",
            label: filters.education,
            change: { education: "" },
          },
        ]
      : []),
    ...(filters.location
      ? [
          {
            key: "location",
            label: filters.location,
            change: { location: "" },
          },
        ]
      : []),
  ]

  return { experience, preset, chips }
}
