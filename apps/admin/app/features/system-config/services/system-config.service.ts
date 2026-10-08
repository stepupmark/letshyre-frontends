import { http } from "@/lib/api/http-client"
import {
  systemConfigResponseSchema,
  type SystemConfigUpdate,
} from "../schemas/system-config.schema"

const URL = "commonapp/v1/admin/settings/system-config/"

export const systemConfigService = {
  async get(signal?: AbortSignal) {
    const { data } = await http.get(URL, { signal })
    return systemConfigResponseSchema.parse(data).data
  },

  async update(payload: SystemConfigUpdate) {
    const { data } = await http.patch(URL, payload)
    return systemConfigResponseSchema.parse(data).data
  },
}
