import { expect, test } from "vitest"

import { resolveLocale } from "./resolve"

test("the saved choice wins, then the browser, but only for ready locales", () => {
  const ready = ["en", "de", "hi"] as const
  expect(resolveLocale({ saved: "hi", languages: ["de-DE"], ready })).toBe("hi")
  expect(
    resolveLocale({ saved: null, languages: ["fr-FR", "de-AT"], ready })
  ).toBe("de")
  expect(resolveLocale({ saved: "ar", languages: ["ar"], ready })).toBe("en")
})
