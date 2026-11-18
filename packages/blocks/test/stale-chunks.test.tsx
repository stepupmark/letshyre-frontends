import { beforeEach, describe, expect, it, vi } from "vitest"

import { reloadOnStaleChunk } from "../src/stale-chunks"

function fakeWindow() {
  const target = new EventTarget() as EventTarget & {
    sessionStorage: Storage
    location: { reload: () => void }
  }
  target.sessionStorage = window.sessionStorage
  target.location = { reload: vi.fn() }
  return target
}

const fail = (target: EventTarget) => {
  const event = new Event("vite:preloadError", { cancelable: true })
  target.dispatchEvent(event)
  return event
}

describe("reloadOnStaleChunk", () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it("reloads once and stops the error from reaching the app", () => {
    const target = fakeWindow()
    reloadOnStaleChunk(target as unknown as Window, () => 100_000)
    const event = fail(target)
    expect(target.location.reload).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(true)
  })

  it("lets a second failure through instead of reloading in a loop", () => {
    const target = fakeWindow()
    let time = 100_000
    reloadOnStaleChunk(target as unknown as Window, () => time)
    fail(target)
    time += 5_000
    const second = fail(target)
    expect(target.location.reload).toHaveBeenCalledTimes(1)
    expect(second.defaultPrevented).toBe(false)
  })

  it("reloads again for a later deploy", () => {
    const target = fakeWindow()
    let time = 100_000
    reloadOnStaleChunk(target as unknown as Window, () => time)
    fail(target)
    time += 120_000
    fail(target)
    expect(target.location.reload).toHaveBeenCalledTimes(2)
  })
})
