import { describe, expect, test } from "vitest"

import { errorKey } from "../src/error-key.ts"
import { HttpError } from "../src/errors.ts"

const validation = {
  success: false,
  status: 400,
  message: "Validation failed.",
  data: {
    error: ["You must complete an interview before applying for a job."],
  },
}

describe("an error whose reason sits under data.error", () => {
  test("keeps the reason next to the generic message", () => {
    const error = new HttpError(400, validation)
    expect(error.backendMessage).toBe("Validation failed.")
    expect(error.reasons).toEqual([
      "You must complete an interview before applying for a job.",
    ])
  })

  test("is matched by its reason, not the generic message", () => {
    const key = errorKey(new HttpError(400, validation), {
      messages: {
        "you must complete an interview before applying for a job":
          "errors.needsInterview",
      },
      fallback: "errors.generic",
    })
    expect(key).toBe("errors.needsInterview")
  })
})
