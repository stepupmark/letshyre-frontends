import { xhrUpload } from "@workspace/api"

import { api } from "@/lib/api"

import type { CompanyFormValues } from "../schemas/company-form.schema"

export function saveCompany(values: CompanyFormValues, logo: File | null) {
  const form = new FormData()
  for (const [key, value] of Object.entries(values)) form.append(key, value)
  if (logo) form.append("company_logo", logo)
  return xhrUpload(api, "user/v1/employer_kyc/", form, { method: "PATCH" })
}
