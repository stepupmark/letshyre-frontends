import { xhrUpload } from "@workspace/api"
import { queryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

const text = z.string().nullish()

export const companySchema = z.looseObject({
  name: text,
  full_name: text,
  email: text,
  phone_number: text,
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
    .nullish(),
})
export type Company = z.infer<typeof companySchema>

export const companyQuery = () =>
  queryOptions({
    queryKey: ["employer", "company"],
    queryFn: async () =>
      companySchema.parse(dataOf(await api.get("user/v1/employer_profile/"))),
  })

export interface CompanyEdit {
  official_email: string
  company_address: string
  company_industry: string
  linkedin_url: string
  company_description: string
  company_logo: File | null
}

/** The fields an employer can change after review, in one multipart PATCH. */
export function saveCompany(values: CompanyEdit) {
  const form = new FormData()
  const { company_logo: logo, ...text } = values
  for (const [key, value] of Object.entries(text)) form.append(key, value)
  if (logo) form.append("company_logo", logo)
  return xhrUpload(api, "user/v1/employer_kyc/", form, { method: "PATCH" })
}
