import { http } from "@/lib/api/http-client"
import { creditResponseSchema } from "../schemas/credits.schema"

export const creditsService = {
  async get(signal?: AbortSignal) {
    const { data } = await http.get("finances/v1/credits_managment/", {
      signal,
    })
    return creditResponseSchema.parse(data).data
  },

  async updatePrice(id: string, price: string) {
    const { data } = await http.put(
      `finances/v1/credits_managment_detail/${encodeURIComponent(id)}/`,
      { credit_value: price }
    )
    return creditResponseSchema.parse(data).data
  },
}
