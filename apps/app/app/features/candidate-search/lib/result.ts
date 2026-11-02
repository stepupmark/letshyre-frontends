import type { SearchResult } from "../schemas/candidate-search.schema"

export const rowKey = (row: SearchResult) =>
  `${row.candidate_id}:${String(row.interview_id ?? "")}`

export const nameOf = (row: SearchResult, fallback: string) => {
  const name = row.candidate_name?.trim() ?? ""
  return name === "" ? fallback : name
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

// one decimal, so 4.6 never shows as "5 yrs" next to a 5+ filter
export const yearsOf = (years: number | null) => {
  if (years == null || years <= 0) return null
  return years < 1 ? ("under" as const) : Math.round(years * 10) / 10
}

/** Splits `text` around the first case-insensitive match of `term`. */
export function splitMatch(text: string, term: string) {
  const at = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1
  if (at < 0) return null
  return {
    before: text.slice(0, at),
    match: text.slice(at, at + term.length),
    after: text.slice(at + term.length),
  }
}

export const tidyPlace = (place: string | null | undefined) => {
  const tidy = (place ?? "")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .replace(/^[\s,]+|[\s,]+$/g, "")
  return tidy === "" ? null : tidy
}
