import { describe, expect, it } from "vitest"

import { matchesSchema } from "../schemas/job-matches.schema"
import { bandCounts, bestInterview } from "./job-matches"

describe("matchesSchema", () => {
  it("drops a broken match instead of emptying the list", () => {
    const data = matchesSchema.parse({
      matches: [{ candidate_id: 5 }, { candidate_id: { bad: true } }],
    })
    expect(data.matches.map((m) => m.candidate_id)).toEqual(["5"])
  })
})

describe("bestInterview", () => {
  it("takes the top scored attempt and skips unscored ones", () => {
    const [match] = matchesSchema.parse({
      matches: [
        {
          candidate_id: 1,
          interview_attempts: [
            { role: "a", overall_score: 40 },
            { role: "b", overall_score: null },
            { role: "c", overall_score: "72" },
          ],
        },
      ],
    }).matches
    expect(match && bestInterview(match)).toBe(72)
  })
})

describe("bandCounts", () => {
  it("bands by the rounded AI score, then the plain score", () => {
    const { matches } = matchesSchema.parse({
      matches: [
        { candidate_id: 1, ai_match: { ai_matching_score: 86 } },
        { candidate_id: 2, score: "70" },
        { candidate_id: 3, score: 69.4 },
        { candidate_id: 4 },
      ],
    })
    expect(bandCounts(matches)).toEqual({
      all: 4,
      strong: 2,
      partial: 1,
      low: 1,
    })
  })
})
