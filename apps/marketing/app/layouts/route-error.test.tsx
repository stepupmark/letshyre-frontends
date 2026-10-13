import { I18nProvider } from "@workspace/i18n/react"
import { render, screen } from "@testing-library/react"
import { createRoutesStub } from "react-router"
import { describe, expect, it, vi } from "vitest"

import common from "@/locales/en/common.json"

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
  it("offers a retry and a way home for other errors", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    renderError(new Error("boom"))

    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible()
    expect(screen.getByRole("link", { name: "Go Home" })).toBeVisible()
    expect(screen.getByText(/Error: boom/)).toBeInTheDocument()
  })
})
