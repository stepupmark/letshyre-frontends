import { api } from "@/lib/api"

import { DEFAULT_TITLE } from "../lib/team"
import type { MemberValues } from "../schemas/member-form.schema"

// everyone added here joins as a recruiter
export const addMember = (values: MemberValues) =>
  api.post("user/v1/employer_team_members/", {
    ...values,
    title: DEFAULT_TITLE,
  })

export const updateMember = (
  id: string,
  data: Partial<{ full_name: string; email: string; status: "Active" | "Hold" }>
) => api.patch(`user/v1/employer_team_members/${id}/`, data)

export const removeMember = (id: string) =>
  api.delete(`user/v1/employer_team_members/${id}/`)
