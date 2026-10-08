import { useMutation } from "@tanstack/react-query"
import { patchQueries } from "~/lib/query/optimistic"
import { paymentGatewaysKeys } from "../queries/payment-gateways.queries"
import type { GatewayFormValues } from "../schemas/payment-gateways.schema"
import { paymentGatewaysService } from "../services/payment-gateways.service"

const invalidates = [paymentGatewaysKeys.all]

type Gateways = Awaited<ReturnType<typeof paymentGatewaysService.list>>

export function useCreateGateway() {
  return useMutation({
    mutationFn: (values: GatewayFormValues) =>
      paymentGatewaysService.create(values),
    meta: { successMessage: "Gateway added", invalidates },
  })
}

export function useUpdateGateway() {
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: GatewayFormValues }) =>
      paymentGatewaysService.update(id, values),
    meta: { successMessage: "Gateway updated", invalidates },
  })
}

export function useDeleteGateway() {
  return useMutation({
    mutationFn: (id: string) => paymentGatewaysService.remove(id),
    onMutate: async (id) => ({
      rollback: await patchQueries<Gateways>(paymentGatewaysKeys.all, (list) =>
        list.filter((gateway) => gateway.id !== id)
      ),
    }),
    onError: (_error, _variables, context) => context?.rollback(),
    meta: { successMessage: "Gateway deleted", invalidates },
  })
}
