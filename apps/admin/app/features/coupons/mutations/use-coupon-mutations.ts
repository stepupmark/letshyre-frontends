import { useMutation } from "@tanstack/react-query"
import { patchQueries } from "~/lib/query/optimistic"
import { couponsKeys } from "../queries/coupons.queries"
import type { CouponPayload } from "../schemas/coupons.schema"
import { couponsService } from "../services/coupons.service"

type CouponsPage = Awaited<ReturnType<typeof couponsService.list>>

export function useCreateCoupon() {
  return useMutation({
    mutationFn: (payload: CouponPayload) => couponsService.create(payload),
    meta: { successMessage: "Coupon created", invalidates: [couponsKeys.all] },
  })
}

export function useUpdateCoupon() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CouponPayload }) =>
      couponsService.update(id, payload),
    meta: { successMessage: "Coupon updated", invalidates: [couponsKeys.all] },
  })
}

export function useDeleteCoupon() {
  return useMutation({
    mutationFn: (id: string) => couponsService.remove(id),
    onMutate: async (id) => ({
      rollback: await patchQueries<CouponsPage>(
        [...couponsKeys.all, "list"],
        (page) => ({
          ...page,
          count: page.count - 1,
          results: page.results.filter((coupon) => coupon.id !== id),
        })
      ),
    }),
    onError: (_error, _variables, context) => context?.rollback(),
    meta: { successMessage: "Coupon deleted", invalidates: [couponsKeys.all] },
  })
}
