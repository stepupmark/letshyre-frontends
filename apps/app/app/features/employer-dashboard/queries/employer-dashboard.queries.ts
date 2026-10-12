import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

import { cardsSchema, teamSchema } from "../schemas/employer-dashboard.schema"

export const cardsQuery = () =>
  queryOptions({
    queryKey: ["employer", "dashboard-cards"],
    queryFn: async () =>
      cardsSchema.parse(
        dataOf(await api.get("user/v1/employer_dashboard_cards/"))
      ),
    staleTime: 30_000,
  })

export const teamQuery = () =>
  queryOptions({
    queryKey: ["employer", "team-summary"],
    queryFn: async () =>
      teamSchema.parse(dataOf(await api.get("user/v1/employer_team_members/"))),
    staleTime: 5 * 60_000,
  })
