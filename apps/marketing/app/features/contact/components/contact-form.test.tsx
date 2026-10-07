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

import { ContactForm } from "./contact-form"

vi.mock("@/lib/env", () => ({
  env: { VITE_API_BASE_URL: "https://api.example.test/" },
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
            <ContactForm />
          </QueryClientProvider>
        </I18nProvider>
      ),
    },
  ])
  return render(<Stub initialEntries={[url]} />)
}

async function fillIn() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText("Full Name"), "Ada Lovelace")
  await user.type(screen.getByLabelText("Email Address"), "ada@example.com")
  await user.type(screen.getByLabelText("Subject"), "Hiring help")
  await user.type(
    screen.getByLabelText("Message Details"),
    "We would like to try LetsHyre for three roles."
  )
  await user.click(screen.getByRole("button", { name: "Send Message" }))
}

describe("ContactForm", () => {
  beforeEach(() => {
    send.mockReset()
    sessionStorage.clear()
  })

  it("shows translated errors and doesn't send an invalid form", async () => {
    renderForm()
    await userEvent.click(screen.getByRole("button", { name: "Send Message" }))

    expect(
      await screen.findByText("Name must be at least 2 characters")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Please enter a valid email address")
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Full Name")).toHaveAttribute(
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
      await screen.findByRole("heading", { name: "Message Sent!" })
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
    expect(screen.getByLabelText("Full Name")).toHaveValue("")
  })

  it("tags the subject with the chosen topic", async () => {
    send.mockResolvedValue({ message: "ok" })
    renderForm()
    await userEvent.click(screen.getByRole("button", { name: "Sales & plans" }))
    await fillIn()

    await screen.findByRole("heading", { name: "Message Sent!" })
    expect(send).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ subject: "[Sales] Hiring help" })
    )
  })

  it("pretends to send when the bot trap is filled", async () => {
    const { container } = renderForm()
    const trap = container.querySelector<HTMLInputElement>('[name="website"]')
    if (trap) trap.value = "https://spam.example"
    await fillIn()

    expect(
      await screen.findByRole("heading", { name: "Message Sent!" })
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
    expect(screen.getByLabelText("Full Name")).toHaveValue("Ada Lovelace")
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

  it("prefills the subject for sales enquiries", async () => {
    renderForm("/en/contact?topic=sales")
    expect(await screen.findByLabelText("Subject")).toHaveValue(
      "Custom plan enquiry"
    )
    expect(
      screen.getByRole("button", { name: "Sales & plans" })
    ).toHaveAttribute("aria-pressed", "true")
  })
})
