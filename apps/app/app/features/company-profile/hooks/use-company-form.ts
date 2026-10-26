import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "@workspace/i18n/react"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import {
  FORM_FIELDS,
  makeCompanyFormSchema,
  type CompanyFormValues,
} from "../schemas/company-form.schema"
import type { Company } from "../schemas/company-profile.schema"

type FormField = (typeof FORM_FIELDS)[number]

const isField = (value: string | null): value is FormField =>
  FORM_FIELDS.some((field) => field === value)

/** The company details form, prefilled from KYC; `focus` names a field to start on. */
export function useCompanyForm(
  kyc: NonNullable<Company["kyc"]>,
  focus: string | null
) {
  const { t } = useTranslation("company")
  const schema = useMemo(
    () =>
      makeCompanyFormSchema({
        email: t("errors.email"),
        address: t("errors.address"),
        industry: t("errors.industry"),
        linkedin: t("errors.linkedin"),
        description: t("errors.description"),
      }),
    [t]
  )
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      official_email: kyc.official_email ?? "",
      company_address: kyc.company_address ?? "",
      company_industry: kyc.company_industry ?? "",
      linkedin_url: kyc.linkedin_url ?? "",
      company_description: kyc.company_description ?? "",
    },
    mode: "onSubmit",
  })

  useEffect(() => {
    if (isField(focus)) form.setFocus(focus)
  }, [focus, form])

  return form
}
