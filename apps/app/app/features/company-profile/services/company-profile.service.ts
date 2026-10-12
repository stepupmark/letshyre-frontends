import { xhrUpload } from "@workspace/api"

import { api } from "@/lib/api"

import type { CompanyEdit } from "../types"

/** The fields an employer can change after review, in one multipart PATCH. */
export function saveCompany(values: CompanyEdit) {
  const form = new FormData()
  const { company_logo: logo, ...text } = values
  for (const [key, value] of Object.entries(text)) form.append(key, value)
  if (logo) form.append("company_logo", logo)
  return xhrUpload(api, "user/v1/employer_kyc/", form, { method: "PATCH" })
}
