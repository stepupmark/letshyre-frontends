import { z } from "zod"

export const makeMemberSchema = (
  m: { name: string; email: string; password: string },
  { isNew }: { isNew: boolean }
) =>
  z.object({
    full_name: z.string().trim().min(2, m.name).max(100, m.name),
    email: z.email(m.email),
    password: isNew
      ? z.string().min(8, m.password).max(50, m.password)
      : z.string(),
  })
export type MemberValues = z.infer<ReturnType<typeof makeMemberSchema>>

const LETTERS = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"

/** A 14-character password without look-alike characters, for the admin to pass on. */
export function generatePassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(14))
  return Array.from(bytes, (b) => LETTERS[b % LETTERS.length]).join("")
}
