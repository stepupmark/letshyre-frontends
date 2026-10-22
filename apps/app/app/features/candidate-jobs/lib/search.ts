import type { JobSearch } from "../types"

export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "internship",
  "contract",
  "remote",
] as const
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]

export const SORTS = ["newest", "salary", "experience"] as const
export type Sort = (typeof SORTS)[number]

export const PAY_STEPS = [3, 6, 10, 15, 25] as const
export const MAX_EXPERIENCE = 30
export const PAGE_SIZE = 20

export const EMPTY_SEARCH: JobSearch = {
  q: "",
  location: "",
  types: [],
  industries: [],
  experience: null,
  pay: null,
  hideApplied: false,
  sort: "newest",
  page: 1,
}

const isType = (value: string): value is EmploymentType =>
  (EMPLOYMENT_TYPES as readonly string[]).includes(value)

const isSort = (value: string): value is Sort =>
  (SORTS as readonly string[]).includes(value)

const listOf = (params: URLSearchParams, key: string) => [
  ...new Set(
    params
      .getAll(key)
      .map((value) => value.trim())
      .filter(Boolean)
  ),
]

// old links and saved searches carry "2-5" or "6-10 LPA"; the first number is the closest match
const numberOf = (raw: string | null, max = Infinity) => {
  const value = Number.parseFloat(raw ?? "")
  return Number.isFinite(value) && value >= 0 ? Math.min(value, max) : null
}

export function readSearch(params: URLSearchParams): JobSearch {
  const page = Number.parseInt(params.get("page") ?? "", 10)
  const sort = params.get("sort") ?? ""
  const experience = numberOf(
    params.get("exp") ?? params.get("experience"),
    MAX_EXPERIENCE
  )
  return {
    q: params.get("q")?.trim() ?? "",
    location: params.get("location")?.trim() ?? "",
    types: listOf(params, "type").filter(isType),
    industries: listOf(params, "industry"),
    experience: experience === null ? null : Math.round(experience),
    pay: numberOf(params.get("pay") ?? params.get("salary")),
    hideApplied: params.get("hide") === "applied",
    sort: isSort(sort) ? sort : "newest",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

export function writeSearch(search: JobSearch) {
  const params = new URLSearchParams()
  if (search.q) params.set("q", search.q)
  if (search.location) params.set("location", search.location)
  for (const type of search.types) params.append("type", type)
  for (const industry of search.industries) params.append("industry", industry)
  if (search.experience !== null) params.set("exp", String(search.experience))
  if (search.pay !== null) params.set("pay", String(search.pay))
  if (search.hideApplied) params.set("hide", "applied")
  if (search.sort !== "newest") params.set("sort", search.sort)
  if (search.page > 1) params.set("page", String(search.page))
  return params
}

/** The filters only, so the same search always has the same key whatever the page or order. */
export const searchKey = (search: JobSearch) =>
  writeSearch({ ...search, sort: "newest", page: 1 }).toString()

export const filterCount = (search: JobSearch) =>
  search.types.length +
  search.industries.length +
  Number(search.experience !== null) +
  Number(search.pay !== null) +
  Number(search.hideApplied)

const ORDER: Record<Sort, { sort_by: string; order: string }> = {
  newest: { sort_by: "created_at", order: "desc" },
  salary: { sort_by: "salary", order: "desc" },
  experience: { sort_by: "experience", order: "asc" },
}

export const toApiQuery = (search: JobSearch) => ({
  job_search: search.q || undefined,
  location: search.location || undefined,
  employment_type: search.types.join(",") || undefined,
  industry_type: search.industries.join(",") || undefined,
  experience_min: search.experience ?? undefined,
  experience_max: search.experience ?? undefined,
  salary_min: search.pay ?? undefined,
  job_type: search.hideApplied ? "not_applied" : undefined,
  ...ORDER[search.sort],
  page: search.page,
  limit: PAGE_SIZE,
})

const STORE = "saved-searches:v1"
const MAX_SAVED = 6

export function loadSaved(): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORE) ?? "[]")
    if (!Array.isArray(raw)) return []
    const keys = raw
      .filter((item): item is string => typeof item === "string")
      .map((item) => searchKey(readSearch(new URLSearchParams(item))))
      .filter(Boolean)
    return [...new Set(keys)]
  } catch {
    return []
  }
}

export function storeSaved(list: string[]) {
  try {
    localStorage.setItem(STORE, JSON.stringify(list.slice(0, MAX_SAVED)))
  } catch {
    // private mode: saved searches last until reload
  }
}
