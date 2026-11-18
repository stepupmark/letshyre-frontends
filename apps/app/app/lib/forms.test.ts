// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"

import { afterPress } from "./forms"

const press = (type: "pointerdown" | "pointerup") => {
  document.dispatchEvent(new Event(type))
}

describe("afterPress", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("checks at once when focus leaves without a press, e.g. by Tab", () => {
    const check = vi.fn()
    afterPress(check)
    expect(check).toHaveBeenCalledOnce()
  })

  it("waits until the press that took focus has been released and clicked", () => {
    vi.useFakeTimers()
    const check = vi.fn()
    press("pointerdown")
    afterPress(check)
    expect(check).not.toHaveBeenCalled()

    press("pointerup")
    expect(check).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(check).toHaveBeenCalledOnce()

    afterPress(check)
    expect(check).toHaveBeenCalledTimes(2)
  })
})
