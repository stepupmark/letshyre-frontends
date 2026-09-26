import { useMutation } from "@tanstack/react-query";
import { paymentGatewaysKeys } from "../queries/payment-gateways.queries";
import type { GatewayFormValues } from "../schemas/payment-gateways.schema";
import { paymentGatewaysService } from "../services/payment-gateways.service";

const invalidates = [paymentGatewaysKeys.all];

export function useCreateGateway() {
  return useMutation({
    mutationFn: (values: GatewayFormValues) =>
      paymentGatewaysService.create(values),
    meta: { successMessage: "Gateway added", invalidates },
  });
}

export function useUpdateGateway() {
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: GatewayFormValues }) =>
      paymentGatewaysService.update(id, values),
    meta: { successMessage: "Gateway updated", invalidates },
  });
}

export function useDeleteGateway() {
  return useMutation({
    mutationFn: (id: string) => paymentGatewaysService.remove(id),
    meta: { successMessage: "Gateway deleted", invalidates },
  });
}
