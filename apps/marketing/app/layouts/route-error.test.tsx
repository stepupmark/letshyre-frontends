import { errorId } from "@workspace/blocks/error-screen"
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
  it("offers a retry, a way home and a report carrying the error id", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    const error = new Error("boom")
    renderError(error)

    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible()
    expect(screen.getByRole("link", { name: "Go to home" })).toBeVisible()
    expect(screen.getByRole("link", { name: "Tell us" })).toHaveAttribute(
      "href",
      expect.stringContaining(errorId(error)) as string
    )
  })
})
