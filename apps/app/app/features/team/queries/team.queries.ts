import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"

import { membersSchema } from "../schemas/team.schema"

export const TEAM_KEY = ["employer", "team"] as const

export const membersQuery = () =>
  queryOptions({
    queryKey: TEAM_KEY,
    queryFn: async () =>
      membersSchema.parse(await api.get("user/v1/employer_team_members/"))
        .results,
  })
