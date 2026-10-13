import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

import { kycStatusSchema } from "../schemas/kyc-status.schema"

export const kycStatusQuery = () =>
  queryOptions({
    queryKey: ["employer", "kyc-status"],
    queryFn: async () =>
      kycStatusSchema.parse(dataOf(await api.get("user/v1/employer_profile/"))),
  })
