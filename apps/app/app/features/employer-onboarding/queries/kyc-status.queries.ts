import { payloadOf } from "@workspace/api"
import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"

import { kycStatusSchema } from "../schemas/kyc-status.schema"

export const kycStatusQuery = () =>
  queryOptions({
    queryKey: ["employer", "kyc-status"],
    queryFn: async () =>
      kycStatusSchema.parse(
        payloadOf(await api.get("user/v1/employer_profile/"))
      ),
  })
