// @vitest-environment jsdom

import { describe, expect, it } from "vitest"

import {
  readLocaleCookie,
  serializeLocaleCookie,
  writeLocaleCookie,
} from "../src/locale-cookie.ts"

describe("locale cookie", () => {
  it("reads a valid locale and ignores junk", () => {
    expect(readLocaleCookie("a=1; lh_locale=ar; b=2")).toBe("ar")
    expect(readLocaleCookie("lh_locale=xx")).toBeNull()
    expect(readLocaleCookie("")).toBeNull()
  })

  it("serializes a shared, year-long, lax cookie", () => {
    expect(serializeLocaleCookie("hi", { domain: ".letshyre.ai" })).toBe(
      "lh_locale=hi; Path=/; Max-Age=31536000; SameSite=Lax; Domain=.letshyre.ai; Secure"
    )
    expect(serializeLocaleCookie("hi", { secure: false })).toBe(
      "lh_locale=hi; Path=/; Max-Age=31536000; SameSite=Lax"
    )
  })

  it("writes to document.cookie", () => {
    writeLocaleCookie("ta")
    expect(readLocaleCookie(document.cookie)).toBe("ta")
  })
})
