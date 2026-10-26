import { z } from "zod"

import { companyKycSchema } from "@/lib/company-kyc"
import { envelope, paginated } from "@/lib/schemas"

export const kycListResponseSchema = envelope(paginated(companyKycSchema))
export const kycDetailResponseSchema = envelope(companyKycSchema)

export const rejectKycSchema = z.object({
  remarks: z
    .string()
    .trim()
    .min(10, "At least 10 characters")
    .max(500, "At most 500 characters")
    .refine((value) => !/<[^>]*>/.test(value), "HTML isn't allowed"),
})

export type RejectKycInput = z.infer<typeof rejectKycSchema>
