import { describe, expect, it } from "vitest"

import { matchesSchema } from "../schemas/job-matches.schema"
import { bestInterview } from "./job-matches"

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
