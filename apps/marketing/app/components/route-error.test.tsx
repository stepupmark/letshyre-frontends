import { LOCALES } from "@workspace/i18n"
import { I18nProvider } from "@workspace/i18n/react"
import { render, screen, within } from "@testing-library/react"
import { createRoutesStub } from "react-router"
import { describe, expect, it, vi } from "vitest"

import common from "@/locales/en/common.json"

import { errorId } from "./error-id"
import { RouteError } from "./route-error"

function renderError(error: unknown) {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => (
        <I18nProvider lang="en" messages={{ en: { common } }}>
          <RouteError error={error} />
        </I18nProvider>
      ),
    },
  ])
  return render(<Stub />)
}

describe("RouteError", () => {
  it("links a 404 home and to every locale home in its own language", () => {
    renderError({ status: 404, statusText: "", internal: false, data: null })

    expect(screen.getByRole("link", { name: "Go Home" })).toHaveAttribute(
      "href",
      "/en"
    )
    const nav = screen.getByRole("navigation", { name: "Language" })
    const links = within(nav).getAllByRole("link")
    expect(links).toHaveLength(LOCALES.length)
    const arabic = within(nav).getByRole("link", { name: "العربية" })
    expect(arabic).toHaveAttribute("href", "/ar")
    expect(arabic).toHaveAttribute("lang", "ar")
  })

  it("offers a retry and a way home for other errors", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    renderError(new Error("boom"))

    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible()
    expect(screen.getByRole("link", { name: "Go Home" })).toBeVisible()
    expect(
      screen.getByText(errorId(new Error("boom")), { exact: false })
    ).toBeInTheDocument()
  })
})

describe("errorId", () => {
  it("is stable for the same error and differs between errors", () => {
    expect(errorId(new Error("a"))).toBe(errorId(new Error("a")))
    expect(errorId(new Error("a"))).not.toBe(errorId(new Error("b")))
    expect(errorId(new Error("a"))).toMatch(/^[0-9a-f]{8}$/)
  })
})
