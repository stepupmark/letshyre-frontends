import { xhrUpload } from "@workspace/api"
import { queryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { api } from "@/lib/api"

import type { Values } from "./schema"

const industry = z.looseObject({ value: z.string(), label: z.string() })

// the list has come back under several envelopes; always an array here
const listOf = (json: unknown): unknown => {
  const body = json as Record<string, unknown> | null
  const data = body?.data as Record<string, unknown> | unknown[] | undefined
  if (Array.isArray(data)) return data
  return data?.results ?? body?.results ?? body?.industries ?? json
}

export const industriesSchema = z.preprocess(listOf, z.array(industry))

export const industriesQuery = () =>
  queryOptions({
    queryKey: ["industries"],
    queryFn: async () =>
      industriesSchema.parse(await api.get("user/v1/industries/list/")),
    staleTime: Infinity,
  })

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
