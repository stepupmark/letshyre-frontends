import * as z from "zod";

export const jobRejectSchema = z.object({
  rejectReason: z
    .string()
    .min(1, "Please provide a reason for rejection")
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason must be under 500 characters")
    .refine((val) => !/<[^>]*>/.test(val), "HTML tags are not allowed"),
});

export type JobRejectFormValues = z.infer<typeof jobRejectSchema>;
