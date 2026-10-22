import type { Member } from "../schemas/team.schema"

export const DEFAULT_TITLE = "Recruiter"

export const isActive = (member: Member) =>
  (member.status ?? "Active").toLowerCase() === "active"

export const nameOf = (member: Member) => {
  const name = member.full_name?.trim()
  if (name) return name
  const email = member.email?.trim()
  return email === "" ? null : (email ?? null)
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

const LETTERS = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
// the largest multiple of LETTERS.length under 256, so every letter is equally likely
const LIMIT = 256 - (256 % LETTERS.length)

export function generatePassword(length = 14) {
  let out = ""
  while (out.length < length) {
    for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
      if (byte < LIMIT && out.length < length)
        out += LETTERS.charAt(byte % LETTERS.length)
    }
  }
  return out
}
