import type { ViewerDocument } from "@/components/document-viewer"
import { z } from "zod"
import { id } from "@/lib/schemas"

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

export type CompanyKyc = z.infer<typeof companyKycSchema>

export function kycDocuments(kyc: CompanyKyc): ViewerDocument[] {
  return [
    { label: "Registration certificate", url: kyc.registration_certificate },
    { label: "GST certificate", url: kyc.gst_certificate },
    { label: "Address proof", url: kyc.address_proof },
    { label: "Authorised ID proof", url: kyc.authorized_id_proof },
    { label: "Bank proof", url: kyc.bank_proof },
  ]
}
