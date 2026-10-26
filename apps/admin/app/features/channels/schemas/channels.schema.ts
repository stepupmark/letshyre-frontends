import { z } from "zod"

import { envelope, id } from "@/lib/schemas"

export const channelSettingsSchema = z.object({
  id,
  email_enabled: z.boolean(),
  sms_enabled: z.boolean(),
  push_enabled: z.boolean(),
  updated_at: z.string().nullish(),
})

export const channelSettingsUpdateSchema = envelope(channelSettingsSchema)

export type ChannelKey = "email_enabled" | "sms_enabled" | "push_enabled"
export type ChannelSettings = z.infer<typeof channelSettingsSchema>
