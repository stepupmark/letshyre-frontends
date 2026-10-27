import { writeTableParams } from "@workspace/api/table-params"

import type { UnlockedFilters } from "../types"

const MAX_SKILLS = 10
const MAX_SKILL_LENGTH = 40
export const MAX_YEARS = 50

// ranges share their edges because the API takes whole years and profiles have decimals
export const EXPERIENCE_PRESETS = [
  { min: null, max: 2 },
  { min: 2, max: 5 },
  { min: 5, max: 10 },
  { min: 10, max: null },
] as const

export const NO_FILTERS: UnlockedFilters = { skills: [], min: null, max: null }

export const cleanSkills = (skills: string[]) => {
  const out: string[] = []
  for (const raw of skills) {
    const skill = raw.trim().slice(0, MAX_SKILL_LENGTH)
    if (skill && !out.some((s) => s.toLowerCase() === skill.toLowerCase()))
      out.push(skill)
  }
  return out.slice(0, MAX_SKILLS)
}

const yearsOf = (value: string | null) => {
  if (!value || !/^\d{1,2}$/.test(value)) return null
  const years = Number(value)
  return years <= MAX_YEARS ? years : null
}

export function readFilters(params: URLSearchParams): UnlockedFilters {
  const skills = cleanSkills((params.get("skills") ?? "").split(","))
  const from = yearsOf(params.get("experience_min"))
  const min = from === 0 ? null : from
  const max = yearsOf(params.get("experience_max"))
  if (min !== null && max !== null && min > max)
    return { skills, min: max, max: min }
  return { skills, min, max }
}

export const writeFilters = (
  params: URLSearchParams,
  { skills, min, max }: UnlockedFilters
) =>
  writeTableParams(params, {
    filters: {
      skills: skills.join(",") || null,
      experience_min: min ? String(min) : null,
      experience_max: max === null ? null : String(max),
    },
  })

export const hasExperience = ({ min, max }: UnlockedFilters) =>
  min !== null || max !== null

export const filterCount = (filters: UnlockedFilters) =>
  filters.skills.length + (hasExperience(filters) ? 1 : 0)

export const filterKey = ({ skills, min, max }: UnlockedFilters) =>
  `${skills.join(",").toLowerCase()}|${String(min)}|${String(max)}`
