import { describe, expect, it } from "vitest"
import { z } from "zod"

import { acknowledge, unwrap } from "../src/envelope.ts"
import { HttpError, ResponseShapeError } from "../src/errors.ts"

const read = unwrap(z.object({ n: z.number() }))

describe("unwrap", () => {
  it("returns parsed data", () => {
    expect(read({ success: true, data: { n: 1, extra: true } })).toEqual({
      n: 1,
    })
  })

  it("throws HttpError for success: false", () => {
    expect(() => read({ success: false, message: "Nope" })).toThrow(HttpError)
    expect(() => read({ success: false, message: "Nope" })).toThrow("Nope")
  })

  it("throws ResponseShapeError for a missing envelope or wrong data", () => {
    expect(() => read({ n: 1 })).toThrow(ResponseShapeError)
    expect(() => read({ success: true, data: { n: "1" } })).toThrow(
      ResponseShapeError
    )
  })
})

describe("acknowledge", () => {
  it("returns the backend message", () => {
    expect(acknowledge({ success: true, message: "Thanks" })).toEqual({
      message: "Thanks",
    })
    expect(acknowledge({ success: true })).toEqual({ message: undefined })
  })
})
