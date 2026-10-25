import type { Page } from "@playwright/test"

import { axe, expect, reply, test } from "./fixtures"

const ORDER = {
  razorpay_key: "rzp_test_key",
  order_id: "order_T1",
  amount: 1445.5,
  currency: "INR",
  purchase_id: "pur-9",
}

// a stand-in for checkout.js: each open() either pays or is closed, in turn
async function fakeRazorpay(page: Page, outcomes: ("pay" | "close")[]) {
  await page.addInitScript((queue) => {
    const w = window as unknown as Record<string, unknown>
    w.razorpayOpened = []
    w.Razorpay = class {
      options: Record<string, unknown>
      constructor(options: Record<string, unknown>) {
        this.options = options
      }
      on() {
        return undefined
      }
      open() {
        ;(w.razorpayOpened as unknown[]).push(this.options.order_id)
        const next = queue.shift()
        setTimeout(() => {
          if (next === "pay")
            (this.options.handler as (r: unknown) => void)({
              razorpay_payment_id: "pay_T1",
              razorpay_order_id: this.options.order_id,
              razorpay_signature: "sig_T1",
            })
          else (this.options.modal as { ondismiss: () => void }).ondismiss()
        }, 50)
      }
    }
  }, outcomes)
}

test("an employer tops up, pays through Razorpay and goes back to the candidate", async ({
  page,
  api,
  signInAs,
}) => {
  const orders: unknown[] = []
  let verified: unknown = null
  let credits = 1
  await api({
    "GET /payment/v1/employer_credits/": (route) =>
      reply(route, { data: { available_credits: credits } }),
    "POST /payment/v1/create_razorpay_order/": async (route) => {
      orders.push(route.request().postDataJSON())
      await reply(route, { success: true, data: ORDER })
    },
    "POST /payment/v1/verify_razorpay_order/": async (route) => {
      verified = route.request().postDataJSON()
      credits = 26
      await reply(route, { success: true })
    },
  })
  await fakeRazorpay(page, ["close", "pay"])
  await signInAs("employer")
  const back = "/employer/candidates?jobId=101&candidate=5"
  await page.goto(`/employer/billing?next=${encodeURIComponent(back)}`)

  await expect(page.getByRole("heading", { name: "Business" })).toBeVisible()
  await axe(page)
  await page.getByText("10 credits", { exact: true }).click()
  await expect(page.getByRole("radio", { name: /^10 credits/ })).toBeChecked()
  await expect(page.getByText("₹490 + GST", { exact: true })).toBeVisible()
  await page.getByText("25 credits", { exact: true }).click()
  await expect(page.getByRole("radio", { name: /^25 credits/ })).toBeChecked()
  await page.getByRole("button", { name: /^Buy 25 credits/ }).click()

  const dialog = page.getByRole("dialog", { name: "25 credits" })
  await expect(dialog.getByText("₹1,445.50", { exact: true })).toBeVisible()
  await dialog.getByRole("button", { name: "Pay ₹1,445.50" }).click()
  await expect(dialog.getByText("Payment cancelled")).toBeVisible()
  await expect(
    dialog.getByText("Nothing was charged.", { exact: false })
  ).toBeVisible()

  await dialog.getByRole("button", { name: "Pay ₹1,445.50" }).click()
  await expect(page.getByText("25 credits added")).toBeVisible()
  // closing Razorpay and paying again reuses the first order
  expect(orders).toEqual([{ tokens: 25 }])
  expect(
    await page.evaluate(
      () => (window as unknown as Record<string, unknown>).razorpayOpened
    )
  ).toEqual(["order_T1", "order_T1"])
  expect(verified).toEqual({
    razorpay_payment_id: "pay_T1",
    razorpay_order_id: "order_T1",
    razorpay_signature: "sig_T1",
    purchase_id: "pur-9",
  })
  await expect(page.getByText("Your balance is now 26")).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Back to the candidate" }).last()
  ).toHaveAttribute("href", back)
})

test("a changed price stops the payment before Razorpay opens", async ({
  page,
  api,
  signInAs,
}) => {
  await api({
    "POST /payment/v1/create_razorpay_order/": (route) =>
      reply(route, { success: true, data: { ...ORDER, amount: 1500 } }),
  })
  await fakeRazorpay(page, ["pay"])
  await signInAs("employer")
  await page.goto("/employer/billing?checkout=25-credits")

  const dialog = page.getByRole("dialog", { name: "25 credits" })
  await dialog.getByRole("button", { name: "Pay ₹1,445.50" }).click()
  await expect(dialog.getByText("Your total has changed")).toBeVisible()
  expect(
    await page.evaluate(
      () => (window as unknown as Record<string, unknown>).razorpayOpened
    )
  ).toEqual([])
})

test("buying pauses with a retry when prices don't load", async ({
  page,
  api,
  signInAs,
}) => {
  let fail = true
  await api({
    "GET /payment/v1/public/calculate-token-cost/": (route) =>
      fail
        ? reply(route, { success: false }, 500)
        : reply(route, { success: true, data: { cost_per_token: "49.00" } }),
  })
  await signInAs("employer")
  await page.goto("/employer/billing")

  await expect(
    page.getByText("Prices didn't load, so buying is paused.")
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: /^Buy \d+ credits/ })
  ).toHaveCount(0)
  fail = false
  await page.getByRole("button", { name: "Try again" }).click()
  await expect(
    page.getByRole("button", { name: "Buy 25 credits" })
  ).toBeEnabled()
  await expect(page.getByText("₹1,225 + GST", { exact: true })).toBeVisible()
})

test("invoices list paid purchases and open a receipt", async ({
  page,
  signInAs,
}) => {
  await signInAs("employer")
  await page.goto("/employer/invoices")
  await expect(page.getByText("2 results")).toBeVisible()
  await expect(
    page.getByText("₹5,782.00 spent · 110 credits bought")
  ).toBeVisible()

  await page
    .getByRole("button", { name: /Business plan/ })
    .filter({ visible: true })
    .click()
  const receipt = page.getByRole("dialog", { name: "Receipt" })
  await expect(receipt.getByText("Coupon WELCOME10")).toBeVisible()
  await expect(receipt.getByText("₹5,203.80")).toBeVisible()
  await expect(receipt.getByRole("link", { name: "PDF" })).toHaveAttribute(
    "href",
    /^https?:\/\/[^/]+\/media\/invoices\/LH-2026-0042\.pdf$/
  )
  await axe(page)
})
