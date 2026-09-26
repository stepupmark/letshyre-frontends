import * as z from "zod";

export const kycRejectSchema = z.object({
  remarks: z
    .string()
    .min(1, "Please provide verification remarks")
    .min(10, "Remarks must be at least 10 characters")
    .max(500, "Remarks must be under 500 characters")
    .refine((val) => !/<[^>]*>/.test(val), "HTML tags are not allowed"),
});

export type KycRejectFormValues = z.infer<typeof kycRejectSchema>;
