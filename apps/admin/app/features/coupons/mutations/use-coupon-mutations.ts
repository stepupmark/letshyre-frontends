import { useMutation } from "@tanstack/react-query";
import { couponsKeys } from "../queries/coupons.queries";
import type { CouponPayload } from "../schemas/coupons.schema";
import { couponsService } from "../services/coupons.service";

export function useCreateCoupon() {
  return useMutation({
    mutationFn: (payload: CouponPayload) => couponsService.create(payload),
    meta: { successMessage: "Coupon created", invalidates: [couponsKeys.all] },
  });
}

export function useUpdateCoupon() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CouponPayload }) =>
      couponsService.update(id, payload),
    meta: { successMessage: "Coupon updated", invalidates: [couponsKeys.all] },
  });
}

export function useDeleteCoupon() {
  return useMutation({
    mutationFn: (id: string) => couponsService.remove(id),
    meta: { successMessage: "Coupon deleted", invalidates: [couponsKeys.all] },
  });
}
