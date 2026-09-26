import * as z from "zod";

export const creditSchema = z.object({
  creditValue: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !Number.isNaN(Number(val)), "Enter a valid number")
    .refine((val) => Number(val) > 0, "Price must be greater than 0")
    .refine((val) => Number(val) <= 100000, "Price seems too high"),
});

export type CreditFormValues = z.infer<typeof creditSchema>;
