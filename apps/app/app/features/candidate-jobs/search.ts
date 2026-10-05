import type { JobSearch } from "./api"

export const FILTERS = [
  "q",
  "location",
  "type",
  "industry",
  "experience",
  "salary",
] as const
export type Filter = (typeof FILTERS)[number]

export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "internship",
  "contract",
  "freelance",
] as const

export function readSearch(params: URLSearchParams): JobSearch {
  const value = (key: Filter) => params.get(key)?.trim() ?? ""
  const page = Number.parseInt(params.get("page") ?? "", 10)
  return {
    q: value("q"),
    location: value("location"),
    type: value("type"),
    industry: value("industry"),
    experience: value("experience"),
    salary: value("salary"),
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

/** The filters only, in a stable order, so the same search always has the same key. */
export const searchKey = (search: JobSearch) => {
  const params = new URLSearchParams()
  for (const key of FILTERS) if (search[key]) params.set(key, search[key])
  return params.toString()
}

const STORE = "saved-searches:v1"
const MAX_SAVED = 6

export function loadSaved(): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORE) ?? "[]")
    return Array.isArray(raw)
      ? raw.filter((item): item is string => typeof item === "string")
      : []
  } catch {
    return []
  }
}

export function storeSaved(list: string[]) {
  try {
    localStorage.setItem(STORE, JSON.stringify(list.slice(0, MAX_SAVED)))
  } catch {
    /* private mode: saved searches last until reload */
  }
}
