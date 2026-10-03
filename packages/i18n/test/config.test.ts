import { describe, expect, it } from "vitest"

import {
  dirFor,
  isLocale,
  LOCALE_ENGLISH_NAMES,
  LOCALE_NAMES,
  LOCALES,
  localePath,
  OG_LOCALE,
  toLocale,
} from "../src/config.ts"

describe("locale model", () => {
  it("keeps all 19 locales with names and OG locales", () => {
    expect(LOCALES).toHaveLength(19)
    for (const locale of LOCALES) {
      expect(LOCALE_NAMES[locale]).toBeTruthy()
      expect(LOCALE_ENGLISH_NAMES[locale]).toBeTruthy()
      expect(OG_LOCALE[locale]).toMatch(/^[a-z]{2}_[A-Z]{2}$/)
    }
  })

  it("narrows unknown values", () => {
    expect(isLocale("ar")).toBe(true)
    expect(isLocale("xx")).toBe(false)
    expect(isLocale(undefined)).toBe(false)
    expect(toLocale("ja")).toBe("ja")
    expect(toLocale("EN")).toBe("en")
  })

  it("is rtl for arabic and urdu only", () => {
    expect(dirFor("ar")).toBe("rtl")
    expect(LOCALES.filter((l) => dirFor(l) === "rtl")).toEqual(["ar", "ur"])
  })

  it("builds locale paths without trailing slashes", () => {
    expect(localePath("en")).toBe("/en")
    expect(localePath("en", "/")).toBe("/en")
    expect(localePath("hi", "/pricing")).toBe("/hi/pricing")
    expect(localePath("hi", "pricing")).toBe("/hi/pricing")
    expect(localePath("ar", "#faq")).toBe("/ar#faq")
  })
})
