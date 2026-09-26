import { http } from "~/lib/api/http-client";
import {
  paymentSummaryResponseSchema,
  paymentsResponseSchema,
  type PaymentFilters,
} from "../schemas/payments.schema";

export const paymentsService = {
  async summary(signal?: AbortSignal) {
    const { data } = await http.get("payment/v1/payments/dashboard/cards/", {
      signal,
    });
    return paymentSummaryResponseSchema.parse(data).data;
  },

  async list(filters: PaymentFilters, signal?: AbortSignal) {
    const { data } = await http.get("payment/v1/employer/payments/history/", {
      params: filters,
      signal,
    });
    return paymentsResponseSchema.parse(data).data;
  },
};
