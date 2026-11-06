import { z } from "zod"

import { RECIPIENT_LIMIT } from "../lib/recipients"

export const makeSendCandidatesSchema = (m: {
  none: string
  overLimit: string
  names: string
  role: string
}) =>
  z.object({
    recipients: z
      .array(z.object({ email: z.string(), name: z.string() }))
      .min(1, m.none)
      .max(RECIPIENT_LIMIT, m.overLimit)
      .refine((list) => list.every((r) => r.name.trim()), m.names),
    role: z.string().trim().min(1, m.role),
  })
