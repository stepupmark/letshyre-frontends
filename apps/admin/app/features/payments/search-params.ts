import { createLoader, parseAsStringLiteral } from "nuqs"
import { compactParams, pageParser, textParser } from "@/lib/search-params"
import {
  PAYMENT_STATUSES,
  type PaymentFilters,
} from "./schemas/payments.schema"

export const paymentsSearchParams = {
  page: pageParser,
  q: textParser,
  status: parseAsStringLiteral(PAYMENT_STATUSES),
  company: textParser,
  min: textParser,
  max: textParser,
  from: textParser,
  to: textParser,
}

export const loadPaymentsSearchParams = createLoader(paymentsSearchParams)

interface Params {
  page: number
  q: string
  status: string | null
  company: string
  min: string
  max: string
  from: string
  to: string
}

export function toPaymentFilters(params: Params): PaymentFilters {
  return {
    page: params.page,
    ...compactParams({
      search: params.q.trim(),
      payment_status: params.status,
      company: params.company.trim(),
      min_amount: params.min,
      max_amount: params.max,
      start_date: params.from,
      end_date: params.to,
    }),
  }
}
