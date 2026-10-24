import { z } from "zod"

// one odd field shows as empty instead of failing the whole page
const text = z.string().nullish().catch(null)

export const companySchema = z.looseObject({
  open_jobs_posted: z.coerce.number().catch(0),
  total_jobs_posted: z.coerce.number().catch(0),
  kyc: z
    .looseObject({
      company_name: text,
      company_website: text,
      official_email: text,
      company_industry: text,
      linkedin_url: text,
      company_description: text,
      company_address: text,
      company_registration_number: text,
      gst_number: text,
      pan_number: text,
      kyc_status: text,
      company_logo: text,
      registration_certificate: text,
      gst_certificate: text,
      address_proof: text,
      bank_proof: text,
    })
    .nullish()
    .catch(null),
})

export type Company = z.infer<typeof companySchema>
