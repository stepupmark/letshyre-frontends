import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { renderPage } from "../../test/render"
import { SiteHeader } from "./site-header"

let navWidth = 0

class ResizeObserverStub {
  observe() {
    return undefined
  }
  disconnect() {
    return undefined
  }
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverStub)
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: Promise.resolve() },
  })
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(
    function (this: HTMLElement) {
      return this.tagName === "NAV" ? navWidth : 1200
    }
  )
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, 0, 100, 36)
  )
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const header = () => screen.getByRole("banner")

describe("SiteHeader", () => {
  it("keeps the links inline when they fit", () => {
    navWidth = 800
    renderPage(<SiteHeader />)
    expect(header()).not.toHaveAttribute("data-compact")
    expect(
      screen.getByRole("navigation", { name: "Primary navigation" })
    ).toBeInTheDocument()
  })

  it("collapses into the menu when the links overflow", async () => {
    navWidth = 300
    renderPage(<SiteHeader />)
    await waitFor(() => {
      expect(header()).toHaveAttribute("data-compact")
    })
  })

  it("marks the current page", () => {
    navWidth = 800
    renderPage(<SiteHeader />, { path: "/en/pricing" })
    const nav = screen.getByRole("navigation", { name: "Primary navigation" })
    expect(within(nav).getByRole("link", { name: "Pricing" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(
      within(nav).getByRole("link", { name: "About" })
    ).not.toHaveAttribute("aria-current")
  })

  it("opens the menu sheet and closes it after picking a link", async () => {
    navWidth = 300
    const user = userEvent.setup()
    renderPage(<SiteHeader />)

    await user.click(screen.getByRole("button", { name: "Toggle navigation" }))
    const dialog = await screen.findByRole("dialog")
    const menu = within(dialog).getByRole("navigation", {
      name: "Mobile navigation",
    })
    expect(within(menu).getAllByRole("link")).toHaveLength(5)
    expect(
      within(dialog).getByRole("link", { name: "Log in" })
    ).toHaveAttribute("href", expect.stringContaining("/get-started") as string)

    await user.click(within(menu).getByRole("link", { name: "About" }))
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  it("closes the sheet with its close button", async () => {
    const user = userEvent.setup()
    renderPage(<SiteHeader />)
    await user.click(screen.getByRole("button", { name: "Toggle navigation" }))
    await user.click(await screen.findByRole("button", { name: "Close menu" }))
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })
})
