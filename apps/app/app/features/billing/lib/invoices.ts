import type { Invoice } from "../schemas/billing.schema"
import { toPaise } from "./checkout"

// unreadable rows are dropped, so on a single page the rows are the truth
export const invoiceCount = (page: {
  results: Invoice[]
  count: number | null
  totalPages: number
}) =>
  page.totalPages <= 1
    ? page.results.length
    : (page.count ?? page.results.length)

export const invoiceTotals = (rows: Invoice[]) => ({
  spent: rows.reduce((sum, row) => sum + toPaise(row.total), 0) / 100,
  credits: rows.reduce((sum, row) => sum + row.credits, 0),
})
