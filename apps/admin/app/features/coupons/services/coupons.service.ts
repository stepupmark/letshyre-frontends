import { http } from "~/lib/api/http-client";
import {
  couponsResponseSchema,
  type CouponPayload,
} from "../schemas/coupons.schema";

const detailUrl = (id: string) =>
  `user/v1/admin/coupon/detail/${encodeURIComponent(id)}/`;

export const couponsService = {
  async list(page: number, signal?: AbortSignal) {
    const { data } = await http.get("user/v1/admin/coupon/management/", {
      params: { page },
      signal,
    });
    return couponsResponseSchema.parse(data).data;
  },

  async create(payload: CouponPayload) {
    await http.post("user/v1/admin/coupon/management/", payload);
  },

  async update(id: string, payload: CouponPayload) {
    await http.put(detailUrl(id), payload);
  },

  async remove(id: string) {
    await http.delete(detailUrl(id));
  },
};
