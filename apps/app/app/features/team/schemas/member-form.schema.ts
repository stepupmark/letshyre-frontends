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
