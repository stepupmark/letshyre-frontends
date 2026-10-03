// @vitest-environment jsdom

import { render, renderHook, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"

import {
  I18nProvider,
  useFormat,
  useLocale,
  useTranslation,
} from "../src/react.tsx"

function Greeting() {
  const { t } = useTranslation("greet")
  return <p>{t("hello")}</p>
}

describe("I18nProvider", () => {
  it("renders with the messages it was given", () => {
    render(
      <I18nProvider lang="nl" messages={{ nl: { greet: { hello: "Hallo" } } }}>
        <Greeting />
      </I18nProvider>
    )
    expect(screen.getByText("Hallo")).toBeTruthy()
  })

  it("exposes the locale and bound formatters", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <I18nProvider lang="en">{children}</I18nProvider>
    )
    const { result } = renderHook(
      () => ({ locale: useLocale(), format: useFormat() }),
      { wrapper }
    )
    const { locale, format } = result.current
    expect(locale).toBe("en")
    expect(format.number(1000)).toBe("1,000")
    expect(format.currency(5)).toBe("₹5.00")
    expect(format.date("2026-01-02T00:00:00Z", { timeZone: "UTC" })).toBe(
      "1/2/2026"
    )
    expect(format.relative("2026-01-01", "2026-01-02")).toBe("yesterday")
    expect(format.list(["a", "b"])).toBe("a and b")
  })

  it("throws outside the provider", () => {
    expect(() => renderHook(() => useLocale())).toThrow("I18nProvider")
  })
})
