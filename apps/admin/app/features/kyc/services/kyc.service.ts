import { http } from "~/lib/api/http-client";
import {
  kycDetailResponseSchema,
  kycListResponseSchema,
  type KycStatus,
} from "../schemas/kyc.schema";

const detailUrl = (id: string) =>
  `user/v1/admin_kyc_management_detail/${encodeURIComponent(id)}/`;

export const kycService = {
  async list(page: number, status: KycStatus, signal?: AbortSignal) {
    const { data } = await http.get("user/v1/admin_kyc_management/", {
      params: { page, kyc_status: status },
      signal,
    });
    return kycListResponseSchema.parse(data).data;
  },

  async detail(id: string, signal?: AbortSignal) {
    const { data } = await http.get(detailUrl(id), { signal });
    return kycDetailResponseSchema.parse(data).data;
  },

  async review(
    id: string,
    status: Exclude<KycStatus, "Pending">,
    remarks = "",
  ) {
    // the old client always sent a space when there were no remarks, keep that
    await http.patch(detailUrl(id), {
      kyc_status: status,
      verification_remarks: remarks || " ",
    });
  },
};
