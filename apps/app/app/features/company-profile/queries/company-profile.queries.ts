import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

import { companySchema } from "../schemas/company-profile.schema"

export const companyQuery = () =>
  queryOptions({
    queryKey: ["employer", "company"],
    queryFn: async () =>
      companySchema.parse(dataOf(await api.get("user/v1/employer_profile/"))),
    // logo and document links are signed for an hour
    staleTime: 5 * 60_000,
  })
