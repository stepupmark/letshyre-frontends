import * as z from "zod";

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Coupon code must be at least 3 characters")
      .max(30, "Coupon code must be at most 30 characters")
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Coupon code can only contain letters, numbers, hyphens and underscores",
      ),
    discount_type: z.enum(["flat", "percentage"]),
    discount_value: z
      .string()
      .trim()
      .min(1, "Discount value is required")
      .max(20, "Discount value is too long")
      .refine((val) => !Number.isNaN(Number(val)), {
        message: "Discount value must be a number",
      })
      .refine((val) => Number(val) > 0, {
        message: "Discount value must be greater than 0",
      }),
    usage_limit: z
      .string()
      .trim()
      .min(1, "Usage limit is required")
      .max(10, "Usage limit is too long")
      .refine((val) => !Number.isNaN(Number(val)), {
        message: "Usage limit must be a number",
      })
      .refine((val) => Number.isInteger(Number(val)) && Number(val) >= 1, {
        message: "Usage limit must be at least 1",
      }),
    start_date: z.string().trim().min(1, "Start date is required"),
    end_date: z.string().trim().min(1, "End date is required"),
  })
  .refine(
    (data) =>
      data.discount_type !== "percentage" || Number(data.discount_value) <= 99,
    {
      message: "Percentage discount cannot exceed 99",
      path: ["discount_value"],
    },
  )
  .refine(
    (data) =>
      !data.start_date ||
      !data.end_date ||
      new Date(data.end_date).getTime() > new Date(data.start_date).getTime(),
    {
      message: "End date must be after start date",
      path: ["end_date"],
    },
  );

export type CouponFormValues = z.infer<typeof couponSchema>;
