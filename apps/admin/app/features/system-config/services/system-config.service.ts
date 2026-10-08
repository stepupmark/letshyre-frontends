import { api } from "@/lib/api"
import {
  systemConfigResponseSchema,
  type SystemConfigUpdate,
} from "../schemas/system-config.schema"

const URL = "commonapp/v1/admin/settings/system-config/"

export const systemConfigService = {
  async get(signal?: AbortSignal) {
    const data = await api.get(URL, { signal })
    return systemConfigResponseSchema.parse(data).data
  },

  async update(payload: SystemConfigUpdate) {
    const data = await api.patch(URL, payload)
    return systemConfigResponseSchema.parse(data).data
  },
}
