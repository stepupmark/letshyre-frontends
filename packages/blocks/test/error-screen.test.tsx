import { describe, expect, it, vi } from "vitest"

import { errorDetails, errorId } from "../src/error-screen.tsx"

describe("errorId", () => {
  it("gives the same error the same eight-character id", () => {
    const id = errorId(new Error("boom"))
    expect(id).toMatch(/^[0-9a-f]{8}$/)
    expect(errorId(new Error("boom"))).toBe(id)
    expect(errorId(new Error("bang"))).not.toBe(id)
  })

  it("hashes values that aren't errors", () => {
    expect(errorId({ status: 500 })).toBe(errorId({ status: 500 }))
    expect(errorId({ status: 500 })).not.toBe(errorId({ status: 404 }))
  })
})

describe("errorDetails", () => {
  it("logs the error under its id and returns the id with the stack", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined)
    const error = new Error("boom")
    const details = errorDetails(error)
    const id = errorId(error)

    expect(log).toHaveBeenCalledWith(`[error ${id}]`, error)
    expect(details.startsWith(`${id}\n\n`)).toBe(true)
    expect(details).toContain("Error: boom")
    log.mockRestore()
  })
})
