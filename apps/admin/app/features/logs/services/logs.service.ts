import { http } from "@/lib/api/http-client"
import { emailLogsSchema, smsLogsSchema } from "../schemas/logs.schema"

export const logsService = {
  async email(page: number, signal?: AbortSignal) {
    const { data } = await http.get("commonapp/v1/admin/logs/email/", {
      params: { page },
      signal,
    })
    return emailLogsSchema.parse(data)
  },

  async sms(page: number, signal?: AbortSignal) {
    const { data } = await http.get("commonapp/v1/admin/logs/sms/", {
      params: { page },
      signal,
    })
    return smsLogsSchema.parse(data)
  },
}
