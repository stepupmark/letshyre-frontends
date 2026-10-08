import { compactParams, oneOf, pageOf, textOf } from "@/lib/search-params"
import {
  PAYMENT_STATUSES,
  type PaymentFilters,
} from "./schemas/payments.schema"

export function readPaymentsParams(params: URLSearchParams) {
  return {
    page: pageOf(params),
    q: textOf(params, "q"),
    status: oneOf(params.get("status"), PAYMENT_STATUSES),
    company: textOf(params, "company"),
    min: textOf(params, "min"),
    max: textOf(params, "max"),
    from: textOf(params, "from"),
    to: textOf(params, "to"),
  }
}

export function toPaymentFilters(
  params: ReturnType<typeof readPaymentsParams>
): PaymentFilters {
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
