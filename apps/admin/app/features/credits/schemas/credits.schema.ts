import { z } from "zod";
import { envelope, id } from "~/lib/api/schemas";

const creditSchema = z
  .object({
    id,
    credit_value: z.union([z.string(), z.number()]).transform(String),
    is_active: z.boolean().nullish(),
  })
  .transform((credit) => ({
    id: credit.id,
    price: credit.credit_value,
    isActive: credit.is_active ?? true,
  }));

export const creditResponseSchema = envelope(creditSchema);

export const creditPriceSchema = z.object({
  price: z
    .string()
    .trim()
    .min(1, "Enter a price")
    .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), "Use up to 2 decimals")
    .refine((value) => Number(value) > 0, "Must be more than 0")
    .refine((value) => Number(value) <= 100_000, "Must be ₹1,00,000 or less"),
});

export type Credit = z.infer<typeof creditSchema>;
export type CreditPriceInput = z.infer<typeof creditPriceSchema>;
