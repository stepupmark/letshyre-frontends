import { describe, expect, it } from "vitest"

import { isAppPath } from "./app-paths"

describe("isAppPath", () => {
  it("treats every path on this origin as the app's", () => {
    expect(isAppPath("/")).toBe(true)
    expect(isAppPath("/employer/jobs?status=open")).toBe(true)
    expect(isAppPath("/shared-scorecard/abc.def")).toBe(true)
  })

  it("sends absolute and protocol-relative URLs to a full page load", () => {
    expect(isAppPath("https://beta.letshyre.ai/en/pricing")).toBe(false)
    expect(isAppPath("//evil.example/x")).toBe(false)
    expect(isAppPath("/\t/evil.example/x")).toBe(false)
    expect(isAppPath("/\\evil.example/x")).toBe(false)
  })
})
