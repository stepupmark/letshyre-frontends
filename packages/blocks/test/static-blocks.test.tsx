import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ConsentBanner } from "../src/consent-banner.tsx"
import { ErrorScreen, NotFoundScreen } from "../src/error-screen.tsx"
import { Logo } from "../src/logo.tsx"
import { SkipLink } from "../src/skip-link.tsx"
import { ThemeProvider } from "../src/theme-provider.tsx"
import { expectAccessible } from "./axe.ts"

describe("Logo", () => {
  it("is an image named after the brand, with intrinsic size", async () => {
    render(<Logo className="h-8" />)
    const img = screen.getByRole("img", { name: "LetsHyre" })
    expect(img).toHaveAttribute("width", "400")
    expect(img).toHaveClass("h-8", "w-auto")
    expect(img).not.toHaveClass("h-6")
    await expectAccessible()
  })
})

describe("SkipLink", () => {
  it("is the first tab stop and targets main", async () => {
    render(
      <>
        <SkipLink>Skip to content</SkipLink>
        <button type="button">Menu</button>
      </>
    )
    await userEvent.tab()
    const link = screen.getByRole("link", { name: "Skip to content" })
    expect(link).toHaveFocus()
    expect(link).toHaveAttribute("href", "#main")
    await expectAccessible()
  })
})

describe("ErrorScreen", () => {
  it("shows the code, a heading, actions and dev details", async () => {
    render(
      <ErrorScreen
        code={500}
        title="Something went wrong"
        description="Try again."
        details="Error: boom"
      >
        <a href="/en">Go home</a>
      </ErrorScreen>
    )
    expect(
      screen.getByRole("heading", { level: 1, name: "Something went wrong" })
    ).toBeInTheDocument()
    expect(screen.getByText("500")).toBeInTheDocument()
    expect(screen.getByText("Error: boom")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Go home" })).toBeInTheDocument()
    await expectAccessible()
  })

  it("renders the minimal form", () => {
    const { container } = render(<ErrorScreen title="Offline" />)
    expect(container.querySelectorAll("p, pre")).toHaveLength(0)
  })

  it("defaults the not-found code to 404 and works in rtl", async () => {
    render(
      <div dir="rtl" lang="ar">
        <NotFoundScreen title="الصفحة غير موجودة" />
      </div>
    )
    expect(screen.getByText("404")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "الصفحة غير موجودة" })
    ).toBeInTheDocument()
    await expectAccessible()
  })
})

describe("ConsentBanner", () => {
  function renderBanner(dir?: "rtl") {
    const onAccept = vi.fn()
    const onReject = vi.fn()
    render(
      <div dir={dir}>
        <ConsentBanner
          label="Cookie preferences"
          acceptLabel="Accept"
          rejectLabel="Reject"
          onAccept={onAccept}
          onReject={onReject}
        >
          We use cookies to measure ads. <a href="/en/policy">Privacy policy</a>
        </ConsentBanner>
      </div>
    )
    return { onAccept, onReject }
  }

  it("is a named, non-modal region with two equal choices", async () => {
    renderBanner()
    expect(
      screen.getByRole("region", { name: "Cookie preferences" })
    ).toBeInTheDocument()
    expect(screen.queryByRole("dialog")).toBeNull()
    const reject = screen.getByRole("button", { name: "Reject" })
    const accept = screen.getByRole("button", { name: "Accept" })
    expect(reject.className).toBe(accept.className)
    await expectAccessible()
  })

  it("is keyboard reachable and reports the choice", async () => {
    const { onAccept, onReject } = renderBanner()
    const user = userEvent.setup()
    await user.tab()
    await user.tab()
    expect(screen.getByRole("button", { name: "Reject" })).toHaveFocus()
    await user.keyboard("{Enter}")
    await user.click(screen.getByRole("button", { name: "Accept" }))
    expect(onReject).toHaveBeenCalledOnce()
    expect(onAccept).toHaveBeenCalledOnce()
  })

  it("renders in rtl", async () => {
    renderBanner("rtl")
    expect(screen.getAllByRole("button")).toHaveLength(2)
    await expectAccessible()
  })
})

describe("ThemeProvider", () => {
  it("forces the light theme", () => {
    render(
      <ThemeProvider>
        <p>content</p>
      </ThemeProvider>
    )
    expect(screen.getByText("content")).toBeInTheDocument()
    expect(document.documentElement).toHaveClass("light")
    expect(document.documentElement).not.toHaveClass("dark")
  })
})
