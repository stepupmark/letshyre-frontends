import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { AssistantMessage } from "../src/assistant-store.ts"
import { useFollow, useSlashToFocus } from "../src/assistant/hooks.ts"

function Page() {
  const [input, setInput] = useState<HTMLTextAreaElement | null>(null)
  useSlashToFocus(input)
  return (
    <>
      <input aria-label="Search" />
      <button type="button">Elsewhere</button>
      <textarea ref={setInput} aria-label="Ask" />
    </>
  )
}

describe("useSlashToFocus", () => {
  it("jumps to the input when / is pressed outside a field", async () => {
    const user = userEvent.setup()
    render(<Page />)
    await user.click(screen.getByRole("button", { name: "Elsewhere" }))
    await user.keyboard("/")
    const ask = screen.getByRole("textbox", { name: "Ask" })
    expect(ask).toHaveFocus()
    expect(ask).toHaveValue("")
  })

  it("leaves / alone while typing in another field", async () => {
    const user = userEvent.setup()
    render(<Page />)
    const search = screen.getByRole("textbox", { name: "Search" })
    await user.click(search)
    await user.keyboard("a/b")
    expect(search).toHaveFocus()
    expect(search).toHaveValue("a/b")
  })

  it("ignores / with a modifier held", async () => {
    const user = userEvent.setup()
    render(<Page />)
    await user.click(screen.getByRole("button", { name: "Elsewhere" }))
    await user.keyboard("{Control>}/{/Control}")
    expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus()
  })
})

const observed: IntersectionObserverCallback[] = []

function Log({ last }: { last: AssistantMessage }) {
  const { log, end, unseen } = useFollow(last)
  return (
    <div ref={log}>
      <p data-message={last.id}>{last.text}</p>
      <div ref={end} data-testid="end" />
      {unseen && <span>New answer</span>}
    </div>
  )
}

const answer = (id: string): AssistantMessage => ({
  id,
  role: "assistant",
  text: id,
})

const report = (target: Element, isIntersecting: boolean) => {
  act(() => {
    observed.at(-1)?.(
      [{ target, isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver
    )
  })
}

describe("useFollow", () => {
  beforeEach(() => {
    observed.length = 0
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: IntersectionObserverCallback) {
          observed.push(callback)
        }
        observe = () => undefined
        disconnect = () => undefined
      }
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("flags a new answer only while the reader has scrolled away", () => {
    const { rerender } = render(<Log last={answer("a1")} />)
    report(screen.getByTestId("end"), false)
    expect(screen.queryByText("New answer")).not.toBeInTheDocument()

    rerender(<Log last={answer("a2")} />)
    expect(screen.getByText("New answer")).toBeInTheDocument()

    report(screen.getByText("a2"), true)
    expect(screen.queryByText("New answer")).not.toBeInTheDocument()
  })

  it("does not flag an answer the reader is following", () => {
    const { rerender } = render(<Log last={answer("a1")} />)
    rerender(<Log last={answer("a2")} />)
    expect(screen.queryByText("New answer")).not.toBeInTheDocument()
  })
})
