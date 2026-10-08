import { http } from "~/lib/api/http-client"
import {
  channelSettingsSchema,
  channelSettingsUpdateSchema,
  type ChannelKey,
} from "../schemas/channels.schema"

const URL = "commonapp/v1/admin/settings/channels/"

export const channelsService = {
  async get(signal?: AbortSignal) {
    const { data } = await http.get(URL, { signal })
    return channelSettingsSchema.parse(data)
  },

  async update(payload: Partial<Record<ChannelKey, boolean>>) {
    const { data } = await http.patch(URL, payload)
    return channelSettingsUpdateSchema.parse(data).data
  },
}
