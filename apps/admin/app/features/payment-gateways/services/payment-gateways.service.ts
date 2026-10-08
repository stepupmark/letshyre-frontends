import { api } from "@/lib/api"
import {
  gatewaysResponseSchema,
  type GatewayFormValues,
} from "../schemas/payment-gateways.schema"

const LIST_URL = "finances/v1/payment_gateway_managment/"
const detailUrl = (id: string) =>
  `finances/v1/payment_gateway_managment_detail/${encodeURIComponent(id)}/`

function toPayload(values: GatewayFormValues) {
  return {
    name: values.provider,
    display_name: values.displayName,
    is_sandbox: values.environment === "sandbox",
    credentials: {
      client_id: values.clientId,
      client_secret: values.clientSecret,
    },
  }
}

export const paymentGatewaysService = {
  async list(signal?: AbortSignal) {
    const data = await api.get(LIST_URL, { signal })
    return gatewaysResponseSchema.parse(data).data
  },

  async create(values: GatewayFormValues) {
    await api.post(LIST_URL, toPayload(values))
  },

  async update(id: string, values: GatewayFormValues) {
    await api.put(detailUrl(id), toPayload(values))
  },

  async remove(id: string) {
    await api.delete(detailUrl(id))
  },
}
