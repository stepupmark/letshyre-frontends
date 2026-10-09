import { api } from "@/lib/api"
import {
  kycDetailResponseSchema,
  kycListResponseSchema,
} from "../schemas/kyc.schema"
import type { KycStatus } from "@/lib/company-kyc"

const detailUrl = (id: string) =>
  `user/v1/admin_kyc_management_detail/${encodeURIComponent(id)}/`

export const kycService = {
  async list(page: number, status: KycStatus, signal?: AbortSignal) {
    const data = await api.get("user/v1/admin_kyc_management/", {
      query: { page, kyc_status: status },
      signal,
    })
    return kycListResponseSchema.parse(data).data
  },

  async detail(id: string, signal?: AbortSignal) {
    const data = await api.get(detailUrl(id), { signal })
    return kycDetailResponseSchema.parse(data).data
  },

  async review(
    id: string,
    status: Exclude<KycStatus, "Pending">,
    remarks = ""
  ) {
    // empty remarks go as a space, which the API has always been sent
    await api.patch(detailUrl(id), {
      kyc_status: status,
      verification_remarks: remarks || " ",
    })
  },
}
