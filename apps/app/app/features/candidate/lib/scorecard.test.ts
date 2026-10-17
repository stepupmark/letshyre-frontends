import { describe, expect, it } from "vitest"

import type { Question, Scorecard } from "../schemas/scorecard.schema"
import { answered, takeaways } from "./scorecard"

const q = (fields: Partial<Question>) => fields as Question

describe("answered", () => {
  it("stops at the first unanswered question so an early exit isn't scored as zeros", () => {
    const questions = [
      q({ type: "MCQ", answer_provided: "A" }),
      q({ type: "AUDIO", is_dummy_audio: false }),
      q({ type: "TYPING", answer_provided: "" }),
      q({ type: "MCQ", answer_provided: "B" }),
    ]
    expect(answered(questions)).toHaveLength(2)
  })

  it("treats placeholder audio as unanswered", () => {
    expect(answered([q({ type: "AUDIO", is_dummy_audio: true })])).toEqual([])
  })
})

describe("takeaways", () => {
  it("skips blank items and keeps a zero match score", () => {
    const report = {
      category_scores: {
        strengths: ["  ", " Clear structure "],
        areas_for_improvement: [],
      },
      ai_match: { ai_matching_score: 0 },
    } as unknown as Scorecard
    expect(takeaways(report)).toEqual({
      strength: "Clear structure",
      gap: null,
      match: 0,
    })
  })
})
