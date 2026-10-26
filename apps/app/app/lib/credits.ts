import { queryOptions } from "@tanstack/react-query"
import { payloadOf } from "@workspace/api"
import { z } from "zod"

import { api } from "./api"

// one unlock costs one credit; at or below this the app warns
export const LOW_CREDITS = 3

export const creditsSchema = z.looseObject({ available_credits: z.number() })

export const creditsQuery = () =>
  queryOptions({
    queryKey: ["employer", "credits"],
    queryFn: async () =>
      creditsSchema.parse(
        payloadOf(await api.get("payment/v1/employer_credits/"))
      ),
    staleTime: 30_000,
  })
