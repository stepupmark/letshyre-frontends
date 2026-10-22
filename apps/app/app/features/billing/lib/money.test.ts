import { describe, expect, it } from "vitest"

import type { Invoice } from "../schemas/billing.schema"
import { invoiceCount, invoiceTotals } from "./invoices"
import { priceFor, savingsVs } from "./money"

const invoice = (total: number, credits: number): Invoice => ({
  id: String(total),
  number: null,
  paidAt: "2026-09-28T10:00:00Z",
  plan: null,
  credits,
  subtotal: total,
  discount: 0,
  coupon: null,
  gst: 0,
  total,
  reference: null,
  pdf: null,
})

describe("priceFor", () => {
  it("works in paise so rates like 2.35 don't drift", () => {
    expect(priceFor(3, 2.35)).toBe(7.05)
    expect(priceFor(25, 49)).toBe(1225)
  })
})

describe("savingsVs", () => {
  it("rounds down and never goes negative", () => {
    expect(savingsVs(39.2, 49)).toBe(20)
    expect(savingsVs(49, 49)).toBe(0)
    expect(savingsVs(55, 49)).toBe(0)
    expect(savingsVs(10, 0)).toBe(0)
  })
})

describe("invoiceCount", () => {
  it("trusts the rows on a single page", () => {
    const results = [invoice(21.6, 10), invoice(2, 1)]
    expect(invoiceCount({ results, count: 9, totalPages: 1 })).toBe(2)
    expect(invoiceCount({ results, count: 9, totalPages: 3 })).toBe(9)
  })
})

describe("invoiceTotals", () => {
  it("adds money in paise", () => {
    expect(invoiceTotals([invoice(0.1, 1), invoice(0.2, 2)])).toEqual({
      spent: 0.3,
      credits: 3,
    })
  })
})
