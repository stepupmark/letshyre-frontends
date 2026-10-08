import { z } from "zod"
import { envelope, id, paginated } from "~/lib/api/schemas"

export const KYC_STATUSES = ["Pending", "Verified", "Rejected"] as const
export type KycStatus = (typeof KYC_STATUSES)[number]

const text = z.string().nullish()

export const companyKycSchema = z.object({
  id,
  employer: z.union([z.string(), z.number()]).nullish(),
  company_name: text,
  company_logo: text,
  company_website: text,
  website_url: text,
  company_description: text,
  company_industry: text,
  company_registration_number: text,
  gst_number: text,
  pan_number: text,
  company_address: text,
  official_email: text,
  linkedin_url: text,
  verified_by: text,
  verification_remarks: text,
  kyc_status: z.string().nullish(),
  created_at: text,
  registration_certificate: text,
  gst_certificate: text,
  address_proof: text,
  authorized_id_proof: text,
  bank_proof: text,
})

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

export type CompanyKyc = z.infer<typeof companyKycSchema>
export type RejectKycInput = z.infer<typeof rejectKycSchema>
