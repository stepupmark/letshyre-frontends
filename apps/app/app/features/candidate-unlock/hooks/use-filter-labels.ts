import { useTranslation } from "@workspace/i18n/react"

import { hasExperience } from "../lib/filters"
import type { UnlockedFilters } from "../types"

type Range = Pick<UnlockedFilters, "min" | "max">

export function useFilterLabels() {
  const { t } = useTranslation("unlock")

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

  const chips = (filters: UnlockedFilters) => [
    ...filters.skills.map((skill) => ({
      key: `skill:${skill.toLowerCase()}`,
      label: skill,
      change: {
        skills: filters.skills.filter((other) => other !== skill),
      },
    })),
    ...(hasExperience(filters)
      ? [
          {
            key: "experience",
            label: experience(filters),
            change: { min: null, max: null } as Partial<UnlockedFilters>,
          },
        ]
      : []),
  ]

  return { experience, preset, chips }
}
