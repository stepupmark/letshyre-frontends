import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { sendAssistantMessage } from "@workspace/api/public"
import { clearAll } from "@workspace/blocks/assistant-store"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { renderPage } from "../../../test/render"
import { AssistantLauncher } from "./assistant-launcher"

vi.mock("@workspace/api/public", () => ({ sendAssistantMessage: vi.fn() }))
const send = vi.mocked(sendAssistantMessage)

beforeEach(() => {
  send.mockReset()
  clearAll()
})

async function open() {
  const user = userEvent.setup()
  renderPage(<AssistantLauncher />)
  await user.click(
    await screen.findByRole("button", { name: "Open chat assistant" })
  )
  // the panel, its copy and the markdown renderer are lazy chunks
  await screen.findByText("What would you like to know?", undefined, {
    timeout: 10_000,
  })
  return user
}

describe("AssistantLauncher", { timeout: 20_000 }, () => {
  it("loads the panel on first open and answers a suggested prompt", async () => {
    send.mockResolvedValue({
      sessionId: "s1",
      response: "**LetsHyre** runs AI interviews.",
    })
    const user = await open()

    expect(
      screen.getByRole("dialog", { name: "LetsHyre Assistant" })
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "What is LetsHyre?" }))

    expect(
      await screen.findByText("LetsHyre", { selector: "strong" })
    ).toBeInTheDocument()
    const [, body, options] = send.mock.calls[0] ?? []
    expect(body).toEqual({ message: "What is LetsHyre?", sessionId: undefined })
    expect(options?.signal).toBeInstanceOf(AbortSignal)
  })

  it("starts a new chat and brings the old one back on undo", async () => {
    send.mockResolvedValue({
      sessionId: "s1",
      response: "We run AI interviews.",
    })
    const user = await open()
    await user.click(screen.getByRole("button", { name: "What is LetsHyre?" }))
    await screen.findByText("We run AI interviews.")

    await user.click(screen.getByRole("button", { name: "New chat" }))
    expect(screen.queryByText("We run AI interviews.")).not.toBeInTheDocument()
    expect(
      screen.getByRole("textbox", { name: "Ask a question…" })
    ).toHaveFocus()

    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(screen.getByText("We run AI interviews.")).toBeInTheDocument()
  })
})

describe("launcher greeting", () => {
  const greeting = () =>
    screen.queryByRole("button", { name: "Questions about hiring? Ask me." })
  const wait = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms))
  const scrollTo = (y: number) => {
    Object.defineProperty(window, "scrollY", { value: y, configurable: true })
    window.dispatchEvent(new Event("scroll"))
  }

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    sessionStorage.clear()
    scrollTo(0)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("greets once per tab, a few seconds in", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { unmount } = renderPage(<AssistantLauncher />)

    await wait(3000)
    expect(greeting()).not.toBeInTheDocument()
    await wait(1000)
    expect(greeting()).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Dismiss" }))
    expect(greeting()).not.toBeInTheDocument()

    unmount()
    renderPage(<AssistantLauncher />)
    await wait(5000)
    expect(greeting()).not.toBeInTheDocument()
  })

  it("closes on Escape", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage(<AssistantLauncher />)
    await wait(4000)
    expect(greeting()).toBeInTheDocument()

    await user.keyboard("{Escape}")
    expect(greeting()).not.toBeInTheDocument()
  })

  it("stays through a small scroll and goes once the reader moves on", async () => {
    renderPage(<AssistantLauncher />)
    await wait(4000)

    act(() => {
      scrollTo(60)
    })
    expect(greeting()).toBeInTheDocument()

    act(() => {
      scrollTo(200)
    })
    expect(greeting()).not.toBeInTheDocument()
  })

  it("opens the chat and never greets again in the tab", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { unmount } = renderPage(<AssistantLauncher />)
    await wait(4000)

    const hello = greeting()
    if (!hello) throw new Error("expected the greeting")
    await user.click(hello)
    expect(
      screen.getByRole("dialog", { name: "LetsHyre Assistant" })
    ).toBeInTheDocument()

    unmount()
    sessionStorage.removeItem("launcher:greeted")
    renderPage(<AssistantLauncher />)
    await wait(5000)
    expect(greeting()).not.toBeInTheDocument()
  })
})
