import { describe, expect, it } from "vitest"

import {
  dirFor,
  isLocale,
  LOCALES,
  localePath,
  toLocale,
} from "../src/config.ts"

describe("locale model", () => {
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
