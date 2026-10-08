import { createLoader, parseAsStringLiteral } from "nuqs"
import { pageParser } from "~/lib/search-params"
import { KYC_STATUSES } from "./schemas/kyc.schema"

export const kycSearchParams = {
  status: parseAsStringLiteral(KYC_STATUSES).withDefault("Pending"),
  page: pageParser,
}

export const loadKycSearchParams = createLoader(kycSearchParams)
