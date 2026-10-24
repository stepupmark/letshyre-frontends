import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { subscribe } from "@workspace/api/public"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderPage } from "../../../../test/render"
import { NewsletterForm } from "./newsletter-form"

vi.mock("@workspace/api/public", () => ({ subscribe: vi.fn() }))

const subscribeMock = vi.mocked(subscribe)

beforeEach(() => {
  subscribeMock.mockReset()
})

const setup = async () => {
  const user = userEvent.setup()
  renderPage(<NewsletterForm />)
  // the button stays disabled until the lazy form logic has loaded
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Subscribe" })).toBeEnabled()
  })
  return {
    user,
    email: screen.getByLabelText("Email address"),
    submit: screen.getByRole("button", { name: "Subscribe" }),
  }
}

describe("NewsletterForm", () => {
  it("asks for an email before sending anything", async () => {
    const { user, email, submit } = await setup()
    await user.click(submit)
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter your email address."
    )
    expect(email).toHaveAttribute("aria-invalid", "true")

    await user.type(email, "nope")
    await user.click(submit)
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter a valid email address"
    )
    expect(subscribeMock).not.toHaveBeenCalled()
  })

  it("subscribes the trimmed email and confirms inline", async () => {
    subscribeMock.mockResolvedValue({ message: "ok" })
    const { user, email, submit } = await setup()
    await user.type(email, " me@company.com ")
    await user.click(submit)

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Subscription saved successfully."
    )
    expect(subscribeMock).toHaveBeenCalledWith(
      expect.anything(),
      "me@company.com"
    )
    expect(screen.queryByLabelText("Email address")).not.toBeInTheDocument()
  })

  it("keeps the form and explains when the request fails", async () => {
    subscribeMock.mockRejectedValue(new Error("boom"))
    const { user, email, submit } = await setup()
    await user.type(email, "me@company.com")
    await user.click(submit)

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to subscribe. Please try again."
    )
    expect(screen.getByLabelText("Email address")).toHaveValue("me@company.com")
  })
})
