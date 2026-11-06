import { payloadOf, xhrUpload } from "@workspace/api"

import { api } from "@/lib/api"

import { joinAddress, type Values } from "../schemas/onboarding-form.schema"

/** Everything in one multipart PATCH. */
export async function submitKyc(
  values: Values,
  onProgress: (fraction: number) => void
) {
  const {
    address_line: _line,
    address_city: _city,
    address_state: _state,
    address_pin: _pin,
    ...rest
  } = values
  const form = new FormData()
  for (const [key, value] of Object.entries(rest)) form.append(key, value)
  form.append("company_address", joinAddress(values))
  return payloadOf(
    await xhrUpload(api, "user/v1/employer_kyc/", form, {
      method: "PATCH",
      onProgress,
    })
  )
}
