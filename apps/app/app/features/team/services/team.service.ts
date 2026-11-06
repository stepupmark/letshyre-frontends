import { payloadOf } from "@workspace/api"

import { api } from "@/lib/api"

import { DEFAULT_TITLE } from "../lib/team"
import type { MemberValues } from "../schemas/member-form.schema"

// everyone added here joins as a recruiter
export const addMember = async (values: MemberValues) =>
  payloadOf(
    await api.post("user/v1/employer_team_members/", {
      ...values,
      title: DEFAULT_TITLE,
    })
  )

export const updateMember = async (
  id: string,
  data: Partial<{ full_name: string; email: string; status: "Active" | "Hold" }>
) => payloadOf(await api.patch(`user/v1/employer_team_members/${id}/`, data))

export const removeMember = async (id: string) =>
  payloadOf(await api.delete(`user/v1/employer_team_members/${id}/`))
