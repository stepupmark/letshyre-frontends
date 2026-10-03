import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { sendAssistantMessage } from "@workspace/api/public"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderPage } from "../../../test/render"
import { AssistantLauncher } from "./assistant-launcher"

vi.mock("@workspace/api/public", () => ({ sendAssistantMessage: vi.fn() }))
const send = vi.mocked(sendAssistantMessage)

beforeEach(() => {
  send.mockReset()
  sessionStorage.clear()
})

async function open() {
  const user = userEvent.setup()
  renderPage(<AssistantLauncher />)
  await user.click(
    await screen.findByRole("button", { name: "Open chat assistant" })
  )
  // the panel, its copy and the markdown renderer are lazy chunks
  await screen.findByText("Hi! I'm the LetsHyre assistant.", undefined, {
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
    expect(send).toHaveBeenCalledWith(expect.anything(), {
      message: "What is LetsHyre?",
      sessionId: undefined,
    })
    expect(sessionStorage.getItem("lh_assistant_session")).toBe("s1")
  })

  it("reuses the session and lets the visitor retry after an error", async () => {
    sessionStorage.setItem("lh_assistant_session", "s9")
    send.mockRejectedValueOnce(new Error("down"))
    send.mockResolvedValueOnce({ sessionId: "s9", response: "Back again." })
    const user = await open()

    await user.type(
      screen.getByRole("textbox", { name: "Ask a question…" }),
      "Pricing?{Enter}"
    )
    await user.click(await screen.findByRole("button", { name: "Retry" }))

    expect(await screen.findByText("Back again.")).toBeInTheDocument()
    expect(send).toHaveBeenLastCalledWith(expect.anything(), {
      message: "Pricing?",
      sessionId: "s9",
    })
  })

  it("clears the conversation and the session", async () => {
    send.mockResolvedValue({ sessionId: "s1", response: "Hello." })
    const user = await open()
    await user.type(screen.getByRole("textbox"), "Hi{Enter}")
    await screen.findByText("Hello.")

    await user.click(screen.getByRole("button", { name: "Clear" }))
    expect(screen.queryByText("Hello.")).toBeNull()
    expect(sessionStorage.getItem("lh_assistant_session")).toBeNull()
  })
})
