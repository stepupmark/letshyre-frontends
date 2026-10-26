import { describe, expect, it } from "vitest"
import { z } from "zod"

import { payloadOf, unwrap } from "../src/envelope.ts"
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

describe("payloadOf", () => {
  it("opens an envelope or passes a bare payload through", () => {
    expect(payloadOf({ success: true, data: [1] })).toEqual([1])
    expect(payloadOf({ results: [] })).toEqual({ results: [] })
    expect(payloadOf([1, 2])).toEqual([1, 2])
    expect(payloadOf(null)).toBeNull()
  })

  it("throws HttpError for success: false, even without data", () => {
    expect(() => payloadOf({ success: false, message: "No credits" })).toThrow(
      "No credits"
    )
  })
})
