import { describe, expect, it } from "vitest"

import type { ScorecardItem } from "../schemas/candidate.schema"
import { historyOf, newestFirst, roleOf, takenOn } from "./scorecards"

const item = (fields: Partial<ScorecardItem>) =>
  ({ id: "1", overall_score: null, ...fields }) as ScorecardItem

describe("newestFirst", () => {
  it("compares real times, not strings, and puts undated last", () => {
    const sorted = newestFirst([
      item({ id: "a", created_at: "2026-08-02T10:00:00Z" }),
      item({ id: "b", created_at: null }),
      item({ id: "c", created_at: "2026-09-20T15:30:00+05:30" }),
      item({ id: "d", created_at: "2026-09-20" }),
    ])
    expect(sorted.map((s) => s.id)).toEqual(["c", "d", "a", "b"])
  })
})

describe("takenOn", () => {
  it("formats a valid date and returns null for junk", () => {
    expect(takenOn(item({ created_at: "2026-09-20T10:00:00Z" }), "en")).toBe(
      "Sep 20, 2026"
    )
    expect(takenOn(item({ created_at: "soon" }), "en")).toBeNull()
  })
})

describe("roleOf", () => {
  it("treats a blank role as missing", () => {
    expect(roleOf(item({ category_scores: { candidate_role: "  " } }))).toBe(
      null
    )
  })
})

describe("historyOf", () => {
  it("keeps scored interviews, oldest first", () => {
    const history = historyOf([
      item({ id: "new", overall_score: 80 }),
      item({ id: "unscored" }),
      item({ id: "old", overall_score: 30 }),
    ])
    expect(history.map((s) => s.id)).toEqual(["old", "new"])
  })
})
