import { createLoader, parseAsStringLiteral } from "nuqs"
import { pageParser } from "@/lib/search-params"
import { KYC_STATUSES } from "@/lib/company-kyc"

export const kycSearchParams = {
  status: parseAsStringLiteral(KYC_STATUSES).withDefault("Pending"),
  page: pageParser,
}

export const loadKycSearchParams = createLoader(kycSearchParams)
