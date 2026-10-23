import { z } from "zod"

import { isLinkedIn } from "@/lib/company-ids"

export const DESCRIPTION_MAX = 500

export const makeCompanyFormSchema = (
  m: Record<
    "email" | "address" | "industry" | "linkedin" | "description",
    string
  >
) =>
  z.object({
    official_email: z.email(m.email),
    company_address: z.string().trim().min(5, m.address),
    company_industry: z.string().min(1, m.industry),
    linkedin_url: z
      .string()
      .trim()
      .refine((value) => value === "" || isLinkedIn(value), m.linkedin),
    company_description: z.string().trim().max(DESCRIPTION_MAX, m.description),
  })

export type CompanyFormValues = z.infer<
  ReturnType<typeof makeCompanyFormSchema>
>

export const FORM_FIELDS = [
  "official_email",
  "company_address",
  "company_industry",
  "linkedin_url",
  "company_description",
] as const satisfies (keyof CompanyFormValues)[]
