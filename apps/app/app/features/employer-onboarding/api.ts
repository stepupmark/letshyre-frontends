import { xhrUpload } from "@workspace/api"

import { api } from "@/lib/api"

import type { Values } from "./schema"

/** Everything in one multipart PATCH, as the legacy form sent it. */
export function submitKyc(
  values: Values,
  onProgress: (fraction: number) => void
) {
  const form = new FormData()
  for (const [key, value] of Object.entries(values)) form.append(key, value)
  return xhrUpload(api, "user/v1/employer_kyc/", form, {
    method: "PATCH",
    onProgress,
  })
}
