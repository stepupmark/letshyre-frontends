import { queryOptions } from "@tanstack/react-query";
import { paymentGatewaysService } from "../services/payment-gateways.service";

export const paymentGatewaysKeys = {
  all: ["payment-gateways"] as const,
};

export const paymentGatewaysQueries = {
  list: () =>
    queryOptions({
      queryKey: paymentGatewaysKeys.all,
      queryFn: ({ signal }) => paymentGatewaysService.list(signal),
    }),
};
