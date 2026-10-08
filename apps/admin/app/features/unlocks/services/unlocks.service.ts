import { http } from "@/lib/api/http-client"
import {
  unlockedProfilesResponseSchema,
  unlocksOverviewResponseSchema,
  type UnlockedProfilesFilters,
} from "../schemas/unlocks.schema"

export const unlocksService = {
  async overview(signal?: AbortSignal) {
    const { data } = await http.get("user/v1/admin/unlocked_profiles/cards/", {
      signal,
    })
    return unlocksOverviewResponseSchema.parse(data).data
  },

  async list(filters: UnlockedProfilesFilters, signal?: AbortSignal) {
    const { data } = await http.get(
      "user/v1/admin/employer/unlocked-profiles/",
      { params: filters, signal }
    )
    return unlockedProfilesResponseSchema.parse(data).data
  },
}
