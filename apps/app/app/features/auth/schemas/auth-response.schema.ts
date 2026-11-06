import { z } from "zod"

export const replySchema = z.looseObject({
  success: z.boolean().optional(),
  data: z.unknown().optional(),
})

const key = z.string().min(1)

// the code's session key has come back under a few names over time
export const codeSessionSchema = z.union([
  z.looseObject({ otp_session_key: key }).transform((d) => d.otp_session_key),
  z.looseObject({ session_key: key }).transform((d) => d.session_key),
  z
    .looseObject({ data: z.looseObject({ otp_session_key: key }) })
    .transform((d) => d.data.otp_session_key),
])
