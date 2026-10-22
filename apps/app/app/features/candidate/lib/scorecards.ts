import { bandOf, type Band } from "@/lib/score-band"

import type { ScorecardItem } from "../schemas/candidate.schema"

export const BANDS = ["low", "partial", "strong"] as const satisfies Band[]

const HISTORY = 12

export const timeOf = (item: ScorecardItem) => {
  const time = Date.parse(item.created_at ?? "")
  return Number.isNaN(time) ? null : time
}

// undated scorecards go last
export const newestFirst = (items: ScorecardItem[]) =>
  items.toSorted((a, b) => (timeOf(b) ?? 0) - (timeOf(a) ?? 0))

export const roleOf = (item: ScorecardItem) => {
  const role = item.category_scores?.candidate_role?.trim()
  return role === "" ? null : (role ?? null)
}

export const bandOfItem = (item: ScorecardItem) =>
  item.overall_score == null ? null : bandOf(item.overall_score)

export const takenOn = (item: ScorecardItem, locale: string) => {
  const time = timeOf(item)
  return time === null
    ? null
    : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(time)
}

// oldest first, scored only, so the strip reads left to right as progress
export const historyOf = (items: ScorecardItem[]) =>
  items
    .filter((item) => item.overall_score != null)
    .slice(0, HISTORY)
    .reverse()
