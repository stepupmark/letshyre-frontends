import { api } from "@/lib/api"
import { creditResponseSchema } from "../schemas/credits.schema"

export const creditsService = {
  async get(signal?: AbortSignal) {
    const data = await api.get("finances/v1/credits_managment/", {
      signal,
    })
    return creditResponseSchema.parse(data).data
  },

  async updatePrice(id: string, price: string) {
    const data = await api.put(
      `finances/v1/credits_managment_detail/${encodeURIComponent(id)}/`,
      { credit_value: price }
    )
    return creditResponseSchema.parse(data).data
  },
}
