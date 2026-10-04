import { queryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { api } from "./api"
import { dataOf } from "./response"

export const creditsSchema = z.looseObject({ available_credits: z.number() })

export const creditsQuery = () =>
  queryOptions({
    queryKey: ["employer", "credits"],
    queryFn: async () =>
      creditsSchema.parse(
        dataOf(await api.get("payment/v1/employer_credits/"))
      ),
    staleTime: 30_000,
  })
