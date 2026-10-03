import { afterEach, describe, expect, it, vi } from "vitest"

import { addMessages, configureI18n, getI18n } from "../src/create-i18n.ts"

afterEach(() => {
  configureI18n({})
})

describe("getI18n", () => {
  it("caches one ready instance per locale", () => {
    const hi = getI18n("hi")
    expect(hi.isInitialized).toBe(true)
    expect(hi.language).toBe("hi")
    expect(getI18n("hi")).toBe(hi)
    expect(getI18n("nope")).toBe(getI18n("en"))
  })

  it("translates synchronously once messages are added", () => {
    addMessages({ fr: { home: { hello: "Bonjour {{name}}" } } })
    expect(getI18n("fr").t("home:hello", { name: "Asha" })).toBe("Bonjour Asha")
  })

  it("falls back to english for instances created before and after", () => {
    const before = getI18n("de")
    addMessages({ en: { home: { only: "English only" } } })
    expect(before.t("home:only")).toBe("English only")
    expect(getI18n("ko").t("home:only")).toBe("English only")
  })

  it("keeps the first catalog when the same namespace is added again", () => {
    addMessages({ es: { home: { a: "uno" } } })
    addMessages({ es: { home: { a: "dos" } } })
    expect(getI18n("es").t("home:a")).toBe("uno")
  })

  it("reports a missing key once", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined)
    addMessages({ it: { home: {} } })
    getI18n("it").t("home:ghost")
    getI18n("it").t("home:ghost")
    expect(error).toHaveBeenCalledTimes(1)
    expect(error.mock.calls[0]?.[0]).toContain("home:ghost")
  })

  it("pseudo-localizes when configured", () => {
    configureI18n({ pseudo: true })
    addMessages({ ja: { home: { hi: "Hello {{name}}" } } })
    expect(getI18n("ja").t("home:hi", { name: "Ravi" })).toMatch(
      /^⟦Ĥéłłó Ŕáṽí·+⟧$/
    )
  })
})
