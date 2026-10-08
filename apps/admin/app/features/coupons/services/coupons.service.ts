import { api } from "@/lib/api"
import {
  couponsResponseSchema,
  type CouponPayload,
} from "../schemas/coupons.schema"

const detailUrl = (id: string) =>
  `user/v1/admin/coupon/detail/${encodeURIComponent(id)}/`

export const couponsService = {
  async list(page: number, signal?: AbortSignal) {
    const data = await api.get("user/v1/admin/coupon/management/", {
      query: { page },
      signal,
    })
    return couponsResponseSchema.parse(data).data
  },

  async create(payload: CouponPayload) {
    await api.post("user/v1/admin/coupon/management/", payload)
  },

  async update(id: string, payload: CouponPayload) {
    await api.put(detailUrl(id), payload)
  },

  async remove(id: string) {
    await api.delete(detailUrl(id))
  },
}
