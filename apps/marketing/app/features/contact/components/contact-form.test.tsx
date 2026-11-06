import { HttpError, NetworkError } from "@workspace/api"
import type * as publicApi from "@workspace/api/public"
import { sendContactMessage } from "@workspace/api/public"
import { I18nProvider } from "@workspace/i18n/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createRoutesStub } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import contact from "@/locales/en/contact.json"

import { ContactHero } from "./contact-hero"

vi.mock("@/lib/env", () => ({
  env: {
    VITE_API_BASE_URL: "https://api.example.test/",
    VITE_SITE_URL: "https://site.example.test",
  },
}))

vi.mock("@workspace/api/public", async (importOriginal) => ({
  ...(await importOriginal<typeof publicApi>()),
  sendContactMessage: vi.fn(),
}))

const send = vi.mocked(sendContactMessage)

function renderForm(url = "/en/contact") {
  const client = new QueryClient()
  const Stub = createRoutesStub([
    {
      path: "/:lang/contact",
      Component: () => (
        <I18nProvider lang="en" messages={{ en: { contact } }}>
          <QueryClientProvider client={client}>
            <ContactHero />
          </QueryClientProvider>
        </I18nProvider>
      ),
    },
  ])
  return render(<Stub initialEntries={[url]} />)
}

async function fillIn() {
  const user = userEvent.setup()
  await user.type(
    screen.getByRole("textbox", { name: "Full name" }),
    "Ada Lovelace"
  )
  await user.type(
    screen.getByRole("textbox", { name: "Email address" }),
    "ada@example.com"
  )
  await user.type(
    screen.getByRole("textbox", { name: "Subject" }),
    "Hiring help"
  )
  await user.type(
    screen.getByRole("textbox", { name: "Message" }),
    "We would like to try LetsHyre for three roles."
  )
  await user.click(screen.getByRole("button", { name: "Send message" }))
}

describe("contact form", () => {
  beforeEach(() => {
    send.mockReset()
    sessionStorage.clear()
  })

  it("shows translated errors and doesn't send an invalid form", async () => {
    renderForm()
    await userEvent.click(screen.getByRole("button", { name: "Send message" }))

    expect(await screen.findByText("Enter your name")).toBeInTheDocument()
    expect(screen.getByText("Enter your email address")).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveAttribute(
      "aria-invalid",
      "true"
    )
    expect(send).not.toHaveBeenCalled()
  })

  it("sends trimmed values and confirms inline", async () => {
    send.mockResolvedValue({ message: "ok" })
    renderForm()
    await fillIn()

    expect(
      await screen.findByRole("heading", { name: "Message sent" })
    ).toHaveFocus()
    expect(send).toHaveBeenCalledWith(expect.anything(), {
      name: "Ada Lovelace",
      email: "ada@example.com",
      subject: "Hiring help",
      message: "We would like to try LetsHyre for three roles.",
    })

    await userEvent.click(
      screen.getByRole("button", { name: "Send another message" })
    )
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveValue("")
  })

  it("tags the subject with the chosen topic", async () => {
    send.mockResolvedValue({ message: "ok" })
    renderForm("/en/contact?topic=sales")
    await fillIn()

    await screen.findByRole("heading", { name: "Message sent" })
    expect(send.mock.calls[0]?.[1].subject).toMatch(/^\[Sales\] /)
  })

  it("pretends to send when the bot trap is filled", async () => {
    const { container } = renderForm()
    const trap = container.querySelector<HTMLInputElement>('[name="website"]')
    if (trap) trap.value = "https://spam.example"
    await fillIn()

    expect(
      await screen.findByRole("heading", { name: "Message sent" })
    ).toBeInTheDocument()
    expect(send).not.toHaveBeenCalled()
  })

  it("explains a network failure and keeps what was typed", async () => {
    send.mockRejectedValue(new NetworkError("offline"))
    renderForm()
    await fillIn()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't reach our server."
    )
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveValue(
      "Ada Lovelace"
    )
  })

  it("shows the backend's reason for a rejected message", async () => {
    send.mockRejectedValue(
      new HttpError(400, { message: "This email domain is blocked." })
    )
    renderForm()
    await fillIn()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This email domain is blocked."
    )
  })
})
