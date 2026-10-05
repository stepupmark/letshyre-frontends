import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  AssistantChat,
  useAssistant,
  type AssistantSend,
} from "../src/assistant.tsx"
import { clearAll } from "../src/assistant-store.ts"
import { expectAccessible } from "./axe.ts"

const LABELS = {
  log: "Conversation",
  you: "You",
  assistant: "Assistant",
  greeting: "Hi",
  hint: "Ask anything",
  input: "Ask a question",
  send: "Send",
  stop: "Stop",
  thinking: "Thinking",
  stopped: "You stopped this answer.",
  failed: "No answer came back.",
  retry: "Try again",
  clear: "Clear chat",
}

function Chat({ send }: { send: AssistantSend }) {
  const chat = useAssistant("test", send)
  return <AssistantChat chat={chat} labels={LABELS} prompts={["What is it?"]} />
}

function setup(send: AssistantSend) {
  const router = createMemoryRouter([
    { path: "/", element: <Chat send={send} /> },
    { path: "/jobs", element: <h1>Jobs page</h1> },
  ])
  render(<RouterProvider router={router} />)
  return { user: userEvent.setup(), router }
}

beforeEach(() => {
  clearAll()
})

describe("AssistantChat", { timeout: 15_000 }, () => {
  it("answers in Markdown, keeps the session and opens app links in place", async () => {
    const send = vi
      .fn<AssistantSend>()
      .mockResolvedValueOnce({
        sessionId: "s1",
        response: "See [your jobs](/jobs) or [help](https://help.example).",
      })
      .mockResolvedValueOnce({ sessionId: "s1", response: "Sure." })
    const { user, router } = setup(send)

    await user.click(screen.getByRole("button", { name: "What is it?" }))
    const local = await screen.findByRole("link", { name: "your jobs" })
    expect(screen.getByRole("link", { name: "help" })).toHaveAttribute(
      "target",
      "_blank"
    )
    await expectAccessible()

    await user.type(
      screen.getByRole("textbox", { name: "Ask a question" }),
      "And?{Enter}"
    )
    await screen.findByText("Sure.")
    expect(send).toHaveBeenLastCalledWith("And?", "s1", expect.any(AbortSignal))

    await user.click(local)
    expect(router.state.location.pathname).toBe("/jobs")
  })

  it("stops a slow answer and retries it", async () => {
    let signal: AbortSignal | undefined
    const send = vi
      .fn<AssistantSend>()
      .mockImplementationOnce((_m, _s, s) => {
        signal = s
        return new Promise(() => undefined)
      })
      .mockResolvedValueOnce({ sessionId: "s2", response: "Here it is." })
    const { user } = setup(send)

    await user.type(
      screen.getByRole("textbox", { name: "Ask a question" }),
      "Slow one{Enter}"
    )
    await user.click(await screen.findByRole("button", { name: "Stop" }))
    expect(signal?.aborted).toBe(true)
    expect(screen.getByText("You stopped this answer.")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Try again" }))
    await screen.findByText("Here it is.")
    expect(send).toHaveBeenLastCalledWith(
      "Slow one",
      undefined,
      expect.any(AbortSignal)
    )
    expect(
      screen.queryByText("You stopped this answer.")
    ).not.toBeInTheDocument()
  })

  it("offers a retry when the request fails", async () => {
    const send = vi.fn<AssistantSend>().mockRejectedValueOnce(new Error("down"))
    const { user } = setup(send)

    await user.click(screen.getByRole("button", { name: "What is it?" }))
    expect(await screen.findByText("No answer came back.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled()
  })
})

describe("assistant transcript", () => {
  it("comes back after a reload within the hour, and not after", async () => {
    const message = { id: "m1", role: "user", text: "Saved question" }
    const save = (at: number) => {
      sessionStorage.setItem(
        "assistant:v1:restore",
        JSON.stringify({ messages: [message], sessionId: "s9", at })
      )
    }

    save(Date.now() - 60_000)
    vi.resetModules()
    const fresh = await import("../src/assistant-store.ts")
    expect(fresh.snapshot("restore")).toMatchObject({
      messages: [message],
      sessionId: "s9",
    })

    save(Date.now() - 2 * 60 * 60_000)
    vi.resetModules()
    const stale = await import("../src/assistant-store.ts")
    expect(stale.snapshot("restore").messages).toEqual([])
  })
})
