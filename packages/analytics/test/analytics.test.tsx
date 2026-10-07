import { act, renderHook } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  canTrack,
  configureAnalytics,
  pageView,
  parseConsent,
  readConsent,
  clearConsent,
  setConsent,
  track,
  useConsent,
} from "../src/index.ts"

const pixelScript = () =>
  document.querySelector('script[src*="connect.facebook.net"]')

function clearCookies() {
  for (const name of ["lh_consent", "_fbp", "_fbc"]) {
    document.cookie = `${name}=; Path=/; Max-Age=0`
  }
}

beforeEach(() => {
  configureAnalytics({
    enabled: true,
    requireConsent: true,
    metaPixelId: "123",
    cookieDomain: undefined,
  })
})

afterEach(() => {
  clearCookies()
  delete window.fbq
  delete window._fbq
  pixelScript()?.remove()
})

describe("gate", () => {
  it("loads nothing before the visitor chooses", () => {
    pageView()
    track("Lead")
    expect(canTrack()).toBe(false)
    expect(window.fbq).toBeUndefined()
    expect(pixelScript()).toBeNull()
  })

  it("loads nothing after a rejection", () => {
    setConsent(false)
    pageView()
    expect(window.fbq).toBeUndefined()
    expect(pixelScript()).toBeNull()
  })

  it("loads nothing outside production, even with consent", () => {
    configureAnalytics({ enabled: false })
    setConsent(true)
    pageView()
    expect(window.fbq).toBeUndefined()
    expect(pixelScript()).toBeNull()
  })

  it("loads nothing without a pixel id", () => {
    configureAnalytics({ metaPixelId: undefined })
    setConsent(true)
    pageView()
    expect(pixelScript()).toBeNull()
  })

  it("loads the pixel once after consent and queues events", () => {
    setConsent(true)
    pageView()
    track("Contact", { content_name: "contact form" }, "evt-1")
    track("Lead")

    expect(
      document.querySelectorAll('script[src*="fbevents.js"]')
    ).toHaveLength(1)
    expect(window.fbq?.queue).toEqual([
      ["set", "autoConfig", false, "123"],
      ["init", "123"],
      ["track", "PageView"],
      [
        "track",
        "Contact",
        { content_name: "contact form" },
        { eventID: "evt-1" },
      ],
      ["track", "Lead", {}, undefined],
    ])
    expect(window.fbq?.disablePushState).toBe(true)
  })

  it("hands calls to fbevents.js once it has loaded", () => {
    setConsent(true)
    pageView()
    const callMethod = vi.fn()
    if (window.fbq) window.fbq.callMethod = callMethod
    track("Purchase", { value: 499, currency: "INR" })
    expect(callMethod).toHaveBeenCalledWith(
      "track",
      "Purchase",
      { value: 499, currency: "INR" },
      undefined
    )
  })

  it("can skip the consent step when configured to", () => {
    configureAnalytics({ requireConsent: false })
    pageView()
    expect(pixelScript()).not.toBeNull()
  })

  it("stops tracking once consent is withdrawn", () => {
    setConsent(true)
    pageView()
    const queued = window.fbq?.queue.length
    setConsent(false)
    pageView()
    expect(window.fbq?.queue.length).toBe(queued)
  })
})

describe("consent cookie", () => {
  it("round-trips the decision", () => {
    expect(readConsent()).toBeNull()
    setConsent(true)
    expect(readConsent()).toMatchObject({ v: 1, analytics: true })
    expect(readConsent()).toBe(readConsent())
  })

  it("can be withdrawn so the banner asks again", () => {
    setConsent(true)
    clearConsent()
    expect(readConsent()).toBeNull()
  })

  it("ignores malformed values", () => {
    expect(parseConsent("lh_consent=%7Bbroken")).toBeNull()
    expect(
      parseConsent(
        `lh_consent=${encodeURIComponent('{"v":2,"analytics":true,"ts":1}')}`
      )
    ).toBeNull()
    expect(parseConsent("other=1")).toBeNull()
  })

  it("clears Meta's cookies on rejection", () => {
    configureAnalytics({ cookieDomain: "localhost" })
    document.cookie = "_fbp=fb.1.123; Path=/"
    setConsent(false)
    expect(document.cookie).not.toContain("_fbp")
  })

  it("is undecided while prerendering", () => {
    setConsent(true)
    function Probe() {
      return <p>{String(useConsent()?.analytics)}</p>
    }
    expect(renderToString(<Probe />)).toBe("<p>undefined</p>")
  })

  it("updates subscribers", () => {
    const { result, unmount } = renderHook(() => useConsent())
    expect(result.current).toBeNull()
    act(() => {
      setConsent(true)
    })
    expect(result.current?.analytics).toBe(true)
    act(() => {
      setConsent(false)
    })
    expect(result.current?.analytics).toBe(false)
    unmount()
  })
})
