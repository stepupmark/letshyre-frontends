import { http } from "~/lib/api/http-client"
import {
  employerResponseSchema,
  employerSummaryResponseSchema,
  employersResponseSchema,
} from "../schemas/employers.schema"

export const employersService = {
  async list(page: number, signal?: AbortSignal) {
    const { data } = await http.get("user/v1/admin/employers/", {
      params: { page },
      signal,
    })
    return employersResponseSchema.parse(data).data
  },

  async detail(id: string, signal?: AbortSignal) {
    const { data } = await http.get(
      `user/v1/admin/employer_detail/${encodeURIComponent(id)}/`,
      { signal }
    )
    return employerResponseSchema.parse(data).data
  },

  async summary(signal?: AbortSignal) {
    const { data } = await http.get("user/v1/admin/employer/cards/", {
      signal,
    })
    return employerSummaryResponseSchema.parse(data).data
  },
}
