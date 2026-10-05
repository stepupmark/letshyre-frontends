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
    const [, body, options] = send.mock.calls[0] ?? []
    expect(body).toEqual({ message: "What is LetsHyre?", sessionId: undefined })
    expect(options?.signal).toBeInstanceOf(AbortSignal)
  })
})
