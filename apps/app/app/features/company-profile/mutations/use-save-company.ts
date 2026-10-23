import { useMutation, useQueryClient } from "@tanstack/react-query"

import { companyQuery } from "../queries/company-profile.queries"
import type { CompanyFormValues } from "../schemas/company-form.schema"
import { saveCompany } from "../services/company-profile.service"

export function useSaveCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      values,
      logo,
    }: {
      values: CompanyFormValues
      logo: File | null
    }) => saveCompany(values, logo),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: companyQuery().queryKey }),
  })
}
