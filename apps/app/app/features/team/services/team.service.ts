import { api } from "@/lib/api"

import type { NewMember } from "../types"

// everyone added here joins as a recruiter
export const addMember = (values: NewMember) =>
  api.post("user/v1/employer_team_members/", { ...values, title: "Recruiter" })

export const updateMember = (
  id: string,
  data: Partial<{ full_name: string; email: string; status: "Active" | "Hold" }>
) => api.patch(`user/v1/employer_team_members/${id}/`, data)

export const removeMember = (id: string) =>
  api.delete(`user/v1/employer_team_members/${id}/`)
