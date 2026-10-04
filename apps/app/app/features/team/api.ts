import { queryOptions } from "@tanstack/react-query"
import { z } from "zod"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

const memberSchema = z.looseObject({
  id: z.union([z.string(), z.number()]).transform(String),
  full_name: z.string().nullish(),
  email: z.string().nullish(),
  title: z.string().nullish(),
  status: z.string().nullish(),
})
export type Member = z.infer<typeof memberSchema>

export const membersSchema = z.preprocess(
  (json) => {
    const data = dataOf(json)
    return Array.isArray(data) ? { results: data } : data
  },
  z.looseObject({ results: z.array(memberSchema).catch([]) })
)

export const membersQuery = () =>
  queryOptions({
    queryKey: ["employer", "team"],
    queryFn: async () =>
      membersSchema.parse(await api.get("user/v1/employer_team_members/"))
        .results,
  })

export const TEAM_KEY = ["employer", "team"] as const

export const isActive = (member: Member) =>
  (member.status ?? "Active").toLowerCase() === "active"

export interface NewMember {
  full_name: string
  email: string
  password: string
}

// everyone added here joins as a recruiter, as in legacy
export const addMember = (values: NewMember) =>
  api.post("user/v1/employer_team_members/", { ...values, title: "Recruiter" })

export const updateMember = (
  id: string,
  data: Partial<{ full_name: string; email: string; status: "Active" | "Hold" }>
) => api.patch(`user/v1/employer_team_members/${id}/`, data)

export const removeMember = (id: string) =>
  api.delete(`user/v1/employer_team_members/${id}/`)
