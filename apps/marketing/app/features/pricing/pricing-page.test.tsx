import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  getCreditPrice,
  getPublicPlans,
  type Plan,
} from "@workspace/api/public"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderPage } from "../../../test/render"
import { PricingPage } from "./pricing-page"

vi.mock("@workspace/api/public", () => ({
  getPublicPlans: vi.fn(),
  getCreditPrice: vi.fn(),
}))

const plans = vi.mocked(getPublicPlans)
const creditPrice = vi.mocked(getCreditPrice)

const plan = (overrides: Partial<Plan>): Plan => ({
  id: "p-pro",
  slug: "pro",
  name: "Pro",
  credits: 50,
  basePrice: 2450,
  rate: 49,
  planType: "paid_one_time",
  tagline: null,
  highlight: false,
  sortOrder: 1,
  ...overrides,
})

const LIVE = [
  plan({ id: "p-free", slug: "free", planType: "free", basePrice: 0 }),
  plan({}),
  plan({ id: "p-b", slug: "business", basePrice: 4900, highlight: true }),
]

const never = () => new Promise<never>(() => undefined)

beforeEach(() => {
  plans.mockReset()
  creditPrice.mockReset()
})

const card = (name: string) => {
  const heading = screen.getByRole("heading", { level: 3, name })
  const root = heading.closest("[data-slot=card]")
  if (!(root instanceof HTMLElement)) throw new Error(`no card for ${name}`)
  return root
}

describe("PricingPage", () => {
  it("lists every plan with skeletons while prices load", () => {
    plans.mockImplementation(never)
    creditPrice.mockImplementation(never)
    renderPage(<PricingPage />, { path: "/en/pricing" })

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Pay only for the candidates you unlock."
    )
    for (const name of ["Free", "Pro", "Business", "Custom"]) {
      expect(card(name)).toBeInTheDocument()
    }
    // Pro and Business in the grid, plus four top-up packs
    expect(screen.getAllByTestId("price-skeleton")).toHaveLength(6)
    expect(screen.getAllByRole("status")[0]).toHaveTextContent(
      "Loading current prices"
    )
  })

  it("shows live prices and links each plan to the right place", async () => {
    plans.mockResolvedValue(LIVE)
    creditPrice.mockResolvedValue({ costPerCredit: 49 })
    renderPage(<PricingPage />, { path: "/en/pricing" })

    expect(await within(card("Pro")).findByText("₹2,450")).toBeInTheDocument()
    expect(
      within(card("Pro")).getByRole("link", { name: "Buy Pro" })
    ).toHaveAttribute("href", expect.stringContaining("checkout=pro") as string)
    expect(
      within(card("Free")).getByRole("link", { name: "Start free" })
    ).toHaveAttribute(
      "href",
      expect.stringContaining("/employer/register") as string
    )
    expect(
      within(card("Custom")).getByRole("link", { name: "Talk to sales" })
    ).toHaveAttribute("href", "/en/contact?topic=sales")
    expect(
      screen.getByText("Every credit costs ₹49, whichever plan you choose.")
    ).toBeInTheDocument()
    expect(
      await screen.findByRole("link", { name: "Buy 25 credits for ₹1,225" })
    ).toHaveAttribute(
      "href",
      expect.stringContaining("checkout=25-credits") as string
    )
  })

  it("explains a failure and recovers on retry", async () => {
    plans.mockRejectedValueOnce(new Error("down")).mockResolvedValue(LIVE)
    creditPrice.mockResolvedValue({ costPerCredit: 49 })
    const user = userEvent.setup()
    renderPage(<PricingPage />, { path: "/en/pricing" })

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't load today's prices"
    )
    expect(
      within(card("Pro")).getByText("Price unavailable")
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(await within(card("Pro")).findByText("₹2,450")).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("compares plans in a captioned table", () => {
    plans.mockImplementation(never)
    creditPrice.mockImplementation(never)
    renderPage(<PricingPage />, { path: "/en/pricing" })

    const table = screen.getByRole("table", { name: "What each plan includes" })
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((th) => th.textContent)
    ).toEqual(["Feature", "Free", "Pro", "Business", "Custom"])
    expect(within(table).getAllByRole("rowheader")).toHaveLength(8)
  })
})
