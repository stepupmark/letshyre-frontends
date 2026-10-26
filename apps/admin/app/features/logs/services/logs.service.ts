import { api } from "@/lib/api"

import { emailLogsSchema, smsLogsSchema } from "../schemas/logs.schema"

export const logsService = {
  async email(page: number, signal?: AbortSignal) {
    const data = await api.get("commonapp/v1/admin/logs/email/", {
      query: { page },
      signal,
    })
    return emailLogsSchema.parse(data)
  },

  async sms(page: number, signal?: AbortSignal) {
    const data = await api.get("commonapp/v1/admin/logs/sms/", {
      query: { page },
      signal,
    })
    return smsLogsSchema.parse(data)
  },
}
