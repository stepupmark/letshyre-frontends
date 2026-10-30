import type { SearchChange, SearchFilters, SearchParams } from "../types"

export const MAX_YEARS = 50
const MAX_TEXT = 80

// ranges share their edges because the API takes whole years and profiles have decimals
export const EXPERIENCE_PRESETS = [
  { min: null, max: 2 },
  { min: 2, max: 5 },
  { min: 5, max: 10 },
  { min: 10, max: null },
] as const

export const NO_FILTERS: SearchFilters = {
  min: null,
  max: null,
  education: "",
  location: "",
}

const KEYS = {
  search: "q",
  page: "page",
  min: "experience_min",
  max: "experience_max",
  education: "education",
  location: "location",
} as const satisfies Record<keyof SearchParams, string>

const textOf = (value: string | null) =>
  (value ?? "").trim().replace(/\s+/g, " ").slice(0, MAX_TEXT)

const yearsOf = (value: string | null) => {
  if (!value || !/^\d{1,2}$/.test(value)) return null
  const years = Number(value)
  return years <= MAX_YEARS ? years : null
}

const pageOf = (value: string | null) => {
  const page = Number(value)
  return Number.isInteger(page) && page > 1 ? page : 1
}

export function readParams(url: URLSearchParams): SearchParams {
  const from = yearsOf(url.get(KEYS.min))
  const min = from === 0 ? null : from
  const max = yearsOf(url.get(KEYS.max))
  const swap = min !== null && max !== null && min > max
  return {
    search: textOf(url.get(KEYS.search)),
    page: pageOf(url.get(KEYS.page)),
    min: swap ? max : min,
    max: swap ? min : max,
    education: textOf(url.get(KEYS.education)),
    location: textOf(url.get(KEYS.location)),
  }
}

/** Any change but a page turn starts again from page 1. */
export function writeParams(url: URLSearchParams, change: SearchChange) {
  const next = { ...readParams(url), page: 1, ...change }
  const out = new URLSearchParams(url)
  for (const [field, key] of Object.entries(KEYS)) {
    const value = next[field as keyof SearchParams]
    const text = typeof value === "string" ? textOf(value) : value
    if (text === null || text === "" || (field === "page" && text === 1))
      out.delete(key)
    else out.set(key, String(text))
  }
  return out
}

export const hasExperience = ({ min, max }: SearchFilters) =>
  min !== null || max !== null

export const filterCount = (filters: SearchFilters) =>
  (hasExperience(filters) ? 1 : 0) +
  (filters.education ? 1 : 0) +
  (filters.location ? 1 : 0)

export const toQuery = ({
  search,
  page,
  min,
  max,
  education,
  location,
}: SearchParams) => ({
  search,
  page,
  experience_min: min ?? undefined,
  experience_max: max ?? undefined,
  education: education || undefined,
  location: location || undefined,
})
