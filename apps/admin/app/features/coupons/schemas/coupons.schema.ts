import { z } from "zod";
import { envelope, id, paginated } from "~/lib/api/schemas";

const couponSchema = z.object({
  id,
  code: z.string(),
  discount_type: z.enum(["flat", "percentage"]),
  discount_value: z.union([z.string(), z.number()]).transform(String),
  usage_limit: z.number(),
  used_count: z
    .number()
    .nullish()
    .transform((value) => value ?? 0),
  start_date: z.string(),
  end_date: z.string(),
  created_at: z.string().nullish(),
});

export const couponsResponseSchema = envelope(paginated(couponSchema));

const positiveNumber = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter ${label}`)
    .refine((value) => !Number.isNaN(Number(value)), "Enter a number")
    .refine((value) => Number(value) > 0, "Must be more than 0");

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "At least 3 characters")
      .max(30, "At most 30 characters")
      .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, - and _ only"),
    discount_type: z.enum(["flat", "percentage"]),
    discount_value: positiveNumber("a discount"),
    usage_limit: positiveNumber("a usage limit").refine(
      (value) => Number.isInteger(Number(value)),
      "Use a whole number",
    ),
    start_date: z.string().min(1, "Pick a start date"),
    end_date: z.string().min(1, "Pick an end date"),
  })
  .refine(
    (data) =>
      data.discount_type !== "percentage" || Number(data.discount_value) <= 99,
    { message: "At most 99%", path: ["discount_value"] },
  )
  .refine(
    (data) =>
      !data.start_date ||
      !data.end_date ||
      new Date(data.end_date) > new Date(data.start_date),
    { message: "Must be after the start date", path: ["end_date"] },
  );

export type Coupon = z.infer<typeof couponSchema>;
export type CouponFormValues = z.infer<typeof couponFormSchema>;
export type CouponPayload = {
  code: string;
  discount_type: "flat" | "percentage";
  discount_value: string;
  usage_limit: number;
  start_date: string;
  end_date: string;
};
