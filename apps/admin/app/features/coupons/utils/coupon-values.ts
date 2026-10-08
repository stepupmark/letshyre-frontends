import { toDateTimeLocal } from "@/lib/format"
import type {
  Coupon,
  CouponFormValues,
  CouponPayload,
} from "../schemas/coupons.schema"

export const EMPTY_COUPON: CouponFormValues = {
  code: "",
  discount_type: "flat",
  discount_value: "",
  usage_limit: "",
  start_date: "",
  end_date: "",
}

export function toCouponFormValues(coupon: Coupon): CouponFormValues {
  return {
    code: coupon.code,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    usage_limit: String(coupon.usage_limit),
    start_date: toDateTimeLocal(coupon.start_date),
    end_date: toDateTimeLocal(coupon.end_date),
  }
}

export function toCouponPayload(values: CouponFormValues): CouponPayload {
  return {
    code: values.code.toUpperCase(),
    discount_type: values.discount_type,
    discount_value: values.discount_value,
    usage_limit: Number(values.usage_limit),
    start_date: new Date(values.start_date).toISOString(),
    end_date: new Date(values.end_date).toISOString(),
  }
}
