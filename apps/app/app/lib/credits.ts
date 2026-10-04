import { queryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { api } from "./api"

const credits = z.looseObject({ available_credits: z.number() })

// legacy read `data ?? body` here; the envelope isn't guaranteed on this endpoint
const body = (json: unknown) =>
  typeof json === "object" && json !== null && "data" in json ? json.data : json

export const creditsQuery = () =>
  queryOptions({
    queryKey: ["employer", "credits"],
    queryFn: async () =>
      credits.parse(body(await api.get("payment/v1/employer_credits/"))),
    staleTime: 30_000,
  })
