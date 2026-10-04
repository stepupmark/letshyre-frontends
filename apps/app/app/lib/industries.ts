import { queryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { api } from "./api"

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
