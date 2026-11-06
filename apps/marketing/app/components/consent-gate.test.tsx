import { readConsent, setConsent } from "@workspace/analytics"
import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, it, vi } from "vitest"

import { renderPage } from "../../test/render"
import { ConsentGate, ConsentSettings } from "./consent-gate"

vi.mock("@/lib/analytics", () => ({ analyticsEnabled: true }))

it("lets a visitor who accepted take it back and asks again", async () => {
  renderPage(
    <>
      <ConsentSettings />
      <ConsentGate />
    </>
  )
  act(() => {
    setConsent(true)
  })

  await userEvent.click(
    await screen.findByRole("button", { name: "Cookie settings" })
  )

  expect(readConsent()).toBeNull()
  expect(
    await screen.findByRole("button", { name: "Accept" })
  ).toBeInTheDocument()
  expect(
    screen.queryByRole("button", { name: "Cookie settings" })
  ).not.toBeInTheDocument()
})
