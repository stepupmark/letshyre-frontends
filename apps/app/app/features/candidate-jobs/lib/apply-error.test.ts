import { HttpError } from "@workspace/api"
import { expect, test } from "vitest"

import { applyProblem } from "./apply-error"

const rejected = (reason: string) =>
  new HttpError(400, {
    success: false,
    status: 400,
    message: "Validation failed.",
    data: { error: [reason] },
  })

test("an application refused for a missing interview is told apart", () => {
  expect(
    applyProblem(
      rejected("You must complete an interview before applying for a job.")
    )
  ).toBe("needsInterview")
  expect(
    applyProblem(rejected("Please attend an interview before you apply."))
  ).toBe("needsInterview")
})

test("other refusals and outages stay generic", () => {
  expect(applyProblem(rejected("You have already applied for this job."))).toBe(
    "other"
  )
  expect(applyProblem(new HttpError(500, {}))).toBe("other")
})
