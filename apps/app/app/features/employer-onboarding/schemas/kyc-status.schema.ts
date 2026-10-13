import { z } from "zod"

export type ReviewState = "pending" | "verified" | "rejected"

export const kycStatusSchema = z
  .looseObject({
    kyc: z.looseObject({ kyc_status: z.string().nullish() }).nullish(),
  })
  .transform(({ kyc }): ReviewState => {
    const status = kyc?.kyc_status?.toLowerCase()
    if (status === "approved" || status === "verified") return "verified"
    if (status === "rejected") return "rejected"
    return "pending"
  })
