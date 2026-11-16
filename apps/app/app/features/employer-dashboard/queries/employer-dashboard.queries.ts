import { payloadOf } from "@workspace/api"
import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"

import { cardsSchema } from "../schemas/employer-dashboard.schema"

export const cardsQuery = () =>
  queryOptions({
    queryKey: ["employer", "dashboard-cards"],
    queryFn: async () =>
      cardsSchema.parse(
        payloadOf(await api.get("user/v1/employer_dashboard_cards/"))
      ),
    staleTime: 30_000,
  })
