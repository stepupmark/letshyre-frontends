import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { CopyButton } from "@/components/copy-button"
import { industriesQuery } from "@/lib/industries"

import type { CompanyFormValues } from "../schemas/company-form.schema"
import type { Company } from "../schemas/company-profile.schema"
import { Fact, Panel } from "./parts"

function AddLink({
  field,
  children,
}: {
  field: keyof CompanyFormValues
  children: string
}) {
  return (
    <AppLink
      to={`${href("/employer/company/edit")}?focus=${field}`}
      className="inline-flex items-center gap-1 rounded-sm text-brand-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Plus aria-hidden="true" className="size-3.5" />
      {children}
    </AppLink>
  )
}

export function AboutPanel({ company }: { company: Company }) {
  const { t } = useTranslation("company")
  const industries = useQuery(industriesQuery())
  const kyc = company.kyc ?? {}
  const industry =
    industries.data?.find((item) => item.value === kyc.company_industry)
      ?.label ?? kyc.company_industry

  return (
    <Panel
      title={t("about.title")}
      action={
        industry ? (
          <span className="rounded-full bg-brand-muted px-2.5 py-0.5 text-xs font-medium text-brand-text">
            {industry}
          </span>
        ) : undefined
      }
    >
      {kyc.company_description?.trim() ? (
        <p className="max-w-prose text-pretty whitespace-pre-line">
          {kyc.company_description}
        </p>
      ) : (
        <div className="flex flex-col items-start gap-1">
          <p className="text-muted-foreground">{t("about.empty")}</p>
          <AddLink field="company_description">{t("add.description")}</AddLink>
        </div>
      )}
      {!industry && (
        <AddLink field="company_industry">{t("add.industry")}</AddLink>
      )}
    </Panel>
  )
}

export function ContactPanel({ company }: { company: Company }) {
  const { t } = useTranslation("company")
  const kyc = company.kyc ?? {}
  return (
    <Panel title={t("contact.title")}>
      <dl className="grid gap-5 sm:grid-cols-2">
        <Fact label={t("details.email")}>
          {kyc.official_email ? (
            <span className="flex items-center justify-between gap-2">
              <a
                href={`mailto:${kyc.official_email}`}
                className="truncate rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {kyc.official_email}
              </a>
              <CopyButton value={kyc.official_email} />
            </span>
          ) : (
            <AddLink field="official_email">{t("add.email")}</AddLink>
          )}
        </Fact>
        <Fact label={t("details.address")}>
          {kyc.company_address ? (
            <span className="text-pretty">{kyc.company_address}</span>
          ) : (
            <AddLink field="company_address">{t("add.address")}</AddLink>
          )}
        </Fact>
        {!kyc.linkedin_url && (
          <Fact label={t("details.linkedin")}>
            <AddLink field="linkedin_url">{t("add.linkedin")}</AddLink>
          </Fact>
        )}
      </dl>
    </Panel>
  )
}
