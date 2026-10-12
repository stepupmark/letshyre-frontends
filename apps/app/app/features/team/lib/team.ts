import type { Member } from "../schemas/team.schema"

export const isActive = (member: Member) =>
  (member.status ?? "Active").toLowerCase() === "active"
