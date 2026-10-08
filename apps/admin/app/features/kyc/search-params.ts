import { KYC_STATUSES } from "@/lib/company-kyc"
import { oneOf, pageOf } from "@/lib/search-params"

export function readKycParams(params: URLSearchParams) {
  return {
    status: oneOf(params.get("status"), KYC_STATUSES) ?? "Pending",
    page: pageOf(params),
  }
}
